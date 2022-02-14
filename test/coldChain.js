const {expectEvent, BN } = require('@openzeppelin/test-helpers');
const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');

const Chain = artifacts.require("Chain");

contract('Chain', (accounts) => {

  before(async()=>{
    this.owner = accounts[0];

    this.VACCINE_BRANDS = {
      Pfizer:"Pfizer-BioNTech",
      Moderna:"Moderna",
      Janssen:"Johnson and Johnson's Janssen",
      Sputnik:"Sputnik V"
    }

    this.ModeEnums = {
      ISSUER: { val: "ISSUER", pos: 0},
      PROVER: {val: "PROVER", pos: 1},
      VERIFIER: {val: "VERIFIER", pos: 2},
      
    }

    this.StateEnums = {
      MANUFACTURED: { val: "MANUFACTURED", pos: 0},
      DELIVERING_INTERNATIONAL: {val: "DELIVERING_INTERNATIONAL", pos: 1},
      STORED: {val: "STORED", pos: 2},
      DELIVERING_LOCAL: {val: "DELIVERING_LOCAL", pos: 3},
      DELIVERED: {val: "DELIVERED", pos: 4}
    }

    this.defaultEntities = {
      manufacturerA: {id: accounts[1], mode: this.ModeEnums.PROVER.val},
      manufacturerB: {id: accounts[2], mode: this.ModeEnums.PROVER.val},
      inspector: {id: accounts[3], mode: this.ModeEnums.ISSUER.val},
      distributerGlobal: {id: accounts[4], mode: this.ModeEnums.VERIFIER.val},
      distributerLocal: {id: accounts[5], mode: this.ModeEnums.VERIFIER.val},
      immunizer: {id: accounts[6], mode: this.ModeEnums.ISSUER.val},
      traveller: {id: accounts[7], mode: this.ModeEnums.PROVER.val},
      borderAgent: {id: accounts[8], mode: this.ModeEnums.VERIFIER.val},
    }

    this.defaultVaccineBatches = {
      0: {brand: this.VACCINE_BRANDS.Pfizer, manufacturer: this.defaultEntities.manufacturerA.id},
      1: {brand: this.VACCINE_BRANDS.Moderna, manufacturer: this.defaultEntities.manufacturerA.id},
      2: {brand: this.VACCINE_BRANDS.Janssen, manufacturer: this.defaultEntities.manufacturerA.id},
      3: {brand: this.VACCINE_BRANDS.Sputnik, manufacturer: this.defaultEntities.manufacturerA.id},
      4: {brand: this.VACCINE_BRANDS.Pfizer, manufacturer: this.defaultEntities.manufacturerA.id},
      5: {brand: this.VACCINE_BRANDS.Moderna, manufacturer: this.defaultEntities.manufacturerA.id},
      6: {brand: this.VACCINE_BRANDS.Janssen, manufacturer: this.defaultEntities.manufacturerA.id},
      7: {brand: this.VACCINE_BRANDS.Sputnik, manufacturer: this.defaultEntities.manufacturerA.id},
      8: {brand: this.VACCINE_BRANDS.Pfizer, manufacturer: this.defaultEntities.manufacturerA.id},
      9: {brand: this.VACCINE_BRANDS.Sputnik, manufacturer: this.defaultEntities.manufacturerA.id},
    }

    this.chainInstance = await Chain.deployed();
    this.providerOrUrl = "https://localhost:8545";
  });


  it('it should add entities successfully', async () => {
    for(const entity in this.defaultEntities){
      const {id, mode} = this.defaultEntities[entity];

      const result = await this.chainInstance.addEntity(
        id,
        mode, 
        {from: this.owner}
      );

      expectEvent(result.receipt, "AddEntity", {
        entityId: id,
        entityMode: mode
      });

      const retrievedEntity = await this.chainInstance.entities.call(id);
      assert.equal(id, retrievedEntity.id, "Mismatched ids");
      assert.equal(this.ModeEnums[mode].pos, retrievedEntity.mode.toString(), "Mismatched modes" );
    }

  });

  it('it should add vaccine batches successfully', async () => {
    for(let i=0;i< Object.keys(this.defaultVaccineBatches).length; i++){
      const {brand, manufacturer} = this.defaultVaccineBatches[i];

      const result = await this.chainInstance.addVaccineBatch(
        brand,
        manufacturer, 
        {from: this.owner}
      );

      expectEvent(result.receipt, "AddVaccineBatch", {
        vaccineBatchId: String(i),
        manufacturer: manufacturer
      });

      const retrievedVaccineBatch = await this.chainInstance.vaccineBatches.call(i);
      assert.equal(i, retrievedVaccineBatch.id);
      assert.equal(brand, retrievedVaccineBatch.brand);
      assert.equal(manufacturer, retrievedVaccineBatch.manufacturer);
    }
  });

  it('should sign a message and store as a certificate from the issuer to the prover', async () => {
    const mnemonic = "plastic fox right orphan position supreme lucky dumb desert amused punch what";
    this.providerUrl = "http://127.0.0.1:8545";
    const provider = new HDWalletProvider(
      mnemonic,
      this.providerUrl
    );

    this.web3 = new Web3(provider);

    const { inspector, manufacturerA} = this.defaultEntities;
    const vaccineBatchId = 0;
    const message = `Inspector ${inspector.id} has certified vaccine batch #${vaccineBatchId} for Manufacturer ${manufacturerA.id}`;

    const signature = await this.web3.eth.sign(
      this.web3.utils.keccak256(message),
      inspector.id
    );

    const result = await this.chainInstance.issueCertificate(
      inspector.id,
      manufacturerA.id,
      this.StateEnums.MANUFACTURED.val,
      vaccineBatchId,
      signature,
      {from: this.owner}
    );

    expectEvent(result.receipt, "IssueCertificate", {
      issuer:inspector.id,
      prover:manufacturerA.id,
      certificateId: new BN(0),
    });

    const retrievedCertificate = await this.chainInstance.certificates.call(0);

    assert.equal(retrievedCertificate.id, 0);
    assert.equal(retrievedCertificate.issuer['id'], inspector.id);
    assert.equal(retrievedCertificate.prover['id'], manufacturerA.id);
    assert.equal(retrievedCertificate.signature, signature);
    assert.equal(retrievedCertificate.status, this.StateEnums.MANUFACTURED.pos.toString());

  });

  it('should verify that the certificate signature matches the issuer', async () => {
    const { inspector, manufacturerA} = this.defaultEntities;
    const vaccineBatchId = 0;
    const message = `Inspector ${inspector.id} has certified vaccine batch #${vaccineBatchId} for Manufacturer ${manufacturerA.id}`;


    const certificate = await this.chainInstance.certificates.call(0);

    const signatureMatches = await this.chainInstance.isMatchingSignature(
      this.web3.utils.keccak256(messsage),
      certificate.id,
      inspector.id,
      {from: this.owner}
    );
  
    assert.equal(signatureMatches, true);
  });

});
