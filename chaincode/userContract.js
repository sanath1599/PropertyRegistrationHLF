'use strict'

const { Contract } = require('fabric-contract-api')
const { use } = require('chai')

class UserContract extends Contract {
  constructor() {
    // custom name to refer to this smart contract
    super('org.property-registration-network.user')
  }

  // user defined function used at the time of instantiating the smart contract to print the success message on console
  async instantiate(ctx) {
    console.log('Regnet Smart Contract Instantiated')
  }
  /**

 * Create a new user account on the network
 * @param ctx - The transaction context object
 * @param name - Name of the user
 * @param email - Email ID of the user
 * @param PhoneNumber - Phone number of the user
 * @param Aadhar - Aadhar number of the user
 * @return - returns new user object type
 */

  async requestNewUser(ctx, name, emailID, phoneNumber, aadharNumber) {
    if (ctx.clientIdentity.getMSPID() != 'usersMSP') {
      return 'User should be used to raise a user or property registration request'
    }
    const userKey = ctx.stub.createCompositeKey(
      'org.property-registration-network.regnet.requestUser',
      [name + '-' + aadharNumber],
    )
    //check if this user have already requested for Registration
    let userCheck = await ctx.stub
      .getState(userKey)
      .catch((err) => console.log(err))
    try {
      let userCheckBuffer = JSON.parse(userCheck.toString())
      return 'This user have already requested for Registration'
    } catch (err) {
      let newUserObject = {
        name: name,
        emailID: emailID,
        phoneNumber: phoneNumber,
        aadharNumber: aadharNumber,
        createdAt: new Date(),
      }
      let dataBuffer = Buffer.from(JSON.stringify(newUserObject))
      await ctx.stub.putState(userKey, dataBuffer)
      return newUserObject
    }
  }

  /**
   * Recharge user account
   * @param ctx - The transaction context object
   * @param name - Name of the user
   * @param aadharNumber - Email ID of the user
   * @param bankTransactionID - Phone number of the user
   * @return - the user object which have the updated upGrad coin value
   */

  async rechargeAccount(ctx, name, aadharNumber, bankTransactionID) {
    if (ctx.clientIdentity.getMSPID() != 'usersMSP') {
      return 'Users should be used to recharge accounts'
    }
    //create composite key for approved user
    const approvedUserKey = ctx.stub.createCompositeKey(
      'org.property-registration-network.regnet.approvedUser',
      [name + '-' + aadharNumber],
    )

    let approvedUserBuffer = await ctx.stub
      .getState(approvedUserKey)
      .catch((err) => console.log(err))

    try {
      //checking if this user is already approved and is present in the network
      let approvedUserData = JSON.parse(approvedUserBuffer.toString())
      //If loop to limit the bankTransaction ID to upg100, upg500 or upg1000
      let coinValue = 0
      if (bankTransactionID == 'upg100') {
        coinValue = 100
      } else if (bankTransactionID == 'upg500') {
        coinValue = 500
      } else if (bankTransactionID == 'upg1000') {
        coinValue = 1000
      } else {
        return 'Invalid Bank Transaction ID'
      }
      //adding the coin value to upGrad coins
      approvedUserData.upGradCoins += coinValue
      let dataBuffer = Buffer.from(JSON.stringify(approvedUserData))
      await ctx.stub.putState(approvedUserKey, dataBuffer)
      return approvedUserData
    } catch (err) {
      return 'This user is not Approved to make any transcations on this network'
    }
  }

  /**
   * View Approved user
   * @param ctx - The transaction context object
   * @param name - Name of the user
   * @param Aadhar - Aadhar number of the user
   * @return - returns user object
   */

  async viewUser(ctx, name, aadharNumber) {
    const approvedUserKey = ctx.stub.createCompositeKey(
      'org.property-registration-network.regnet.approvedUser',
      [name + '-' + aadharNumber], )
    let userBuffer = await ctx.stub
      .getState(approvedUserKey)
      .catch((err) => console.log(err))
    try {
      //if user exist return user as JSON object
      return JSON.parse(userBuffer.toString())
    } catch (err) {
      return "This user is either not approved or doesn't exist in the Registered network"
    }
  }

  /**
   * Request for property registration on the network
   * @param ctx - The transaction context object
   * @param propertyId - unique ID of the property format (XXX)
   * @param owner - Name of the owner
   * @param price - Property price
   * @param status - registered or onSale
   * @param name - Name of the user
   * @param email - Email ID of the user
   * @param Aadhar - Aadhar number of the user
   * @return - returns property request object
   */
  //Property Registration

  async propertyRegistrationRequest(
    ctx,
    propertyId,
    owner,
    price,
    status,
    name,
    aadharNumber,
  ) {

    if (ctx.clientIdentity.getMSPID() != 'usersMSP') {
      return 'Users should be used to raise property registration request'    
    }
    const propertyKey = ctx.stub.createCompositeKey(
      'org.property-registration-network.regnet.requestPropertyKey',
      [propertyId],
    )
    let propertyDetails = await ctx.stub
      .getState(propertyKey)
      .catch((err) => console.log(err))
    try {
      //if property registration request already exist will return string
      let propertyBuffer = JSON.parse(propertyDetails.toString())
      return 'Request to register this property on the network already exist'
    } catch (err) {
      const approvedUserKey = ctx.stub.createCompositeKey(
        'org.property-registration-network.regnet.approvedUser',
        [name + '-' + aadharNumber],
      )
      let userBuffer = await ctx.stub
        .getState(approvedUserKey)
        .catch((err) => console.log(err))
      try {
        //checking if the user is approved or no
        let userDetails = JSON.parse(userBuffer.toString())
        let newPropertyObject = {
          propertyId: propertyId,
          owner: approvedUserKey,
          price: price,
          status: status,
        }
        let dataBuffer = Buffer.from(JSON.stringify(newPropertyObject))
        await ctx.stub.putState(propertyKey, dataBuffer)
        return newPropertyObject
      } catch (err) {
        return "This user is either not approved or doesn't exist in the Registered network"
      }
    }
  }

  /**
   * View approved property
   * @param ctx - The transaction context object
   * @param propertyId - unique ID
   * @return - returns property object
   */

  async viewProperty(ctx, propertyId) {
    const approvedPropertyKey = ctx.stub.createCompositeKey(
      'org.property-registration-network.regnet.approvedPropertyKey',
      [propertyId],
    )
    let propertyBuffer = await ctx.stub
      .getState(approvedPropertyKey)
      .catch((err) => console.log(err))
    try {
      //checking if property is approved and if it exist in the network
      return JSON.parse(propertyBuffer.toString())
    } catch (err) {
      return "This property is either not approved or doesn't exist in the network."
    }
  }

  /**
   * update property
   * @param ctx - The transaction context object
   * @param propertyId - unique ID
   * @param name - Name of the user
   * @param Aadhar - Aadhar number of the user
   * @param status - registered or onSale
   * @return - returns updated property object
   */

  async updateProperty(ctx, propertyId, name, aadharNumber, status) {
    if (ctx.clientIdentity.getMSPID() != 'usersMSP') {
      return 'Users should be used to Update property details'
    }
    const approvedUserKey = ctx.stub.createCompositeKey(
      'org.property-registration-network.regnet.approvedUser',
      [name + '-' + aadharNumber],
    )
    const approvedPropertyKey = ctx.stub.createCompositeKey(
      'org.property-registration-network.regnet.approvedPropertyKey',
      [propertyId],
    )
    let propertyBuffer = await ctx.stub
      .getState(approvedPropertyKey)
      .catch((err) => console.log(err))
    try {
      //checking if property exist
      let propertyDetails = JSON.parse(propertyBuffer.toString())
      //check if user who is trying to update is actually the propety owner
      if (propertyDetails.owner == approvedUserKey) {
        //Make sure status can  only hold registered & onSale
        if (status == 'registered' || status == 'onSale') {
          propertyDetails.status = status
          let updatedPropertyBuffer = Buffer.from(
            JSON.stringify(propertyDetails),
          )
          await ctx.stub.putState(approvedPropertyKey, updatedPropertyBuffer)
          return propertyDetails
        } else {
          return 'Please re-enter status value again.'
        }
      } else {
        return 'The user is not the owner of the property'
      }
    } catch (err) {
      return "Property either doesn't exist or is not approved on the network"
    }
  }

  /**
   * purchase property
   * @param ctx - The transaction context object
   * @param propertyId - unique ID
   * @param name - Name of the user
   * @param Aadhar - Aadhar number of the user
   * @return - New onwer object, old Owner object and Updated property object
   */

  async purchaseProperty(ctx, propertyId, name, aadharNumber) {
    if (ctx.clientIdentity.getMSPID() != 'usersMSP') {
      return 'Users should be used to purchase a property'
    }
    const approvedPropertyKey = ctx.stub.createCompositeKey(
      'org.property-registration-network.regnet.approvedPropertyKey',
      [propertyId],
    )
    const approvedUserKey = ctx.stub.createCompositeKey(
      'org.property-registration-network.regnet.approvedUser',
      [name + '-' + aadharNumber],
    )
    let propertyBuffer = await ctx.stub
      .getState(approvedPropertyKey)
      .catch((err) => console.log(err))
    try {
      //check if the property is approved and is in the network
      let propertyDetails = JSON.parse(propertyBuffer.toString())
      //checking if status = onSale.
      if (propertyDetails.status == 'onSale') {
        let approvedUserBuffer = await ctx.stub
          .getState(approvedUserKey)
          .catch((err) => console.log(err))
        try {
          //checking if the user is approved on the network
          let approvedUserData = JSON.parse(approvedUserBuffer.toString())

          //checking balance and eligibility
          if (approvedUserData.upGradCoins >= propertyDetails.price) {
            const orignalPropertyOwnerKey = propertyDetails.owner
            let orignalPropertyOwnerBuffer = await ctx.stub
              .getState(orignalPropertyOwnerKey)
              .catch((err) => console.log(err))
            let orignalPropertyOwnerData = JSON.parse(
              orignalPropertyOwnerBuffer.toString(),
            )
            //Ensure buyer is not the owner
            if (orignalPropertyOwnerKey != approvedUserKey) {
              orignalPropertyOwnerData.upGradCoins =
                +orignalPropertyOwnerData.upGradCoins + +propertyDetails.price
              approvedUserData.upGradCoins -= propertyDetails.price
              //Change status to registered and update new owner details
              propertyDetails.owner = approvedUserKey
              propertyDetails.status = 'registered'
              //pushing the new owner details on the ledger
              let newOwnerBuffer = Buffer.from(JSON.stringify(approvedUserData))
              await ctx.stub.putState(approvedUserKey, newOwnerBuffer)
              //pushing the new owner details on the ledger
              let orignalOwnerUpdatedBuffer = Buffer.from(
                JSON.stringify(orignalPropertyOwnerData),
              )
              await ctx.stub.putState(
                orignalPropertyOwnerKey,
                orignalOwnerUpdatedBuffer,
              )
              //pushing the new property details on the ledger
              let propertyUpdateBuffer = Buffer.from(
                JSON.stringify(propertyDetails),
              )
              await ctx.stub.putState(approvedPropertyKey, propertyUpdateBuffer)
              //returning all property details
              return (
                'OldOwner Updated Detail  ' +
                orignalOwnerUpdatedBuffer +
                '                            NewOwner Updated Details ' +
                newOwnerBuffer +
                '                         Updated Property Details ' +
                propertyUpdateBuffer
              )
            } else {
              return 'You already have purchased this Property'
            }
          } else {
            return 'You do not have enough money (upGradCoins) to buy this property, Recharge your account'
          }
        } catch (err) {
          return "The user is either not approved or doesn't exist'"
        }
      } else {
        return 'This roperty is not for SALE.'
      }
    } catch (err) {
      return "Property either doesn't exist or is not approved."
    }
  }
}
module.exports = UserContract
