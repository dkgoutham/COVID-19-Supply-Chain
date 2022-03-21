# VaccineChain
VaccineChain is a system that solves a known problem of trust in the Covid-19 vaccine supply chain using Ethereum Blockchain.

## Vaccine Cold Chain
<img src="https://www.gavi.org/sites/default/files/vaccineswork/2021/Thumb/Vaccine-Cold-Chain-02.width-2880.png"/>

## System Actors 
1) Manufacturer
    - Process raw materials into vaccines
2) Distributor
    - Transports vaccines between locations
3) Inspector
    - Performs quality checks on vaccines
    - Performs quality checks on manufacturing plants
4) Storage Facility
    - Store vaccines in cold temperatures
5) Immunizer (doctors, nurses)
    - Vaccinates people
    - Provides vaccine passport/certificates
6) Traveller (the patient):
    - Receives vaccine
    - Receives vaccine certificate
    - Presents vaccine certificate at the border of the destination country
7) Border Agent
    - Verifies the vaccine certificates/passports

## Problems in the current Supply Chain

<table>
  <tr>
    <th width="10%">
      No.
    </th>
    <th width="35%">
      Problems
    </th>
    <th width="20%">
      Affected Actors
    </th>
    <th width="35%">
      Proposed Solutions
    </th>
  </tr>
  <tr>
    <td>
      1
    </td>
    <td>
      Vaccine passports can be falsified.
    </td>
    <td>
      - Border Agent
    </td>
    <td>
      - Cryptographically verify using on-chain data.
    </td>
  </tr>
  <tr>
    <td>
      2
    </td>
    <td>
      Key facilities may not meet quality standards.
    </td>
    <td>
      - All
    </td>
    <td>
      - Publish inspection results to blockchain.
      - Verify presented inspection results.
    </td>
  </tr>
  <tr>
    <td>
      3
    </td>
    <td>
      Vaccine passports may not be recognized by destination countries.
    </td>
    <td>
      - Distributor
      - Traveller
      - Immunizer
    </td>
    <td>
      - Verify signatures in presented certificates
    </td>
  </tr>
</table>

<p align="center">
  <h2> System Design </h3>
  <h4> Flow </h4>
</p>

- Inspector issues certificate for batch to Manufacturer
- **_Batch status updated to MANUFACTURED_**
- Manufacturer presents certificate to Distributor
- Distributor verifies each certificate
- **_Batch status updated to DELIVERING_INTERNATIONAL_**
- Distributor presents updated certificate to Storage Facility
- Storage Facility verifies each batch certificate
- **_Batch status updated to STORED_**
- Storage Facility presents certificates to Distributor
- Distributor verifies each certificate
- **_Batch status updated to DELIVERING_LOCAL_**
- Distributor presents updated certificate to Immunizer
- Immunizer verifies certificates
- **_Batch status updated to DELIVERED_**
- Immunizer vaccinates Traveller and issues vaccine passport
- **_Certificate issued with status VACCINATED_**
- Traveller presents vaccine passport to Border Agent
- Border Agent verifies vaccine passport


