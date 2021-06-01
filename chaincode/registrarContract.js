'use strict'

const { Contract } = require('fabric-contract-api')

class RegistrarContract extends Contract {
  constructor() {
    super('org.property-registration-network.registrar')
  }
  async instantiate(ctx) {
    console.log('Registrar Smart Contract Instantiated')
  }
  async test(ctx, propertyId) {}
  /**
   * Approve user account on the network
   * @param ctx - The transaction context object
   * @param name - Name of the user
   * @param Aadhar - Aadhar number of the user
   * @return - returns approved user object type
   */
  async approveNewUser(ctx, name, aadharNumber) {
    if (ctx.clientIdentity.getMSPID() != 'registrarMSP') {
      return "Registrar's can only approve user or property request"
    }
    const userKey = ctx.stub.createCompositeKey(
      'org.property-registration-network.regnet.requestUser',
      [name + '-' + aadharNumber],
    )
    const approvedUserKey = ctx.stub.createCompositeKey(
      'org.property-registration-network.regnet.approvedUser',
      [name + '-' + aadharNumber],
    )
    let userBuffer = await ctx.stub
      .getState(userKey)
      .catch((err) => console.log(err))
    try {
      //check if the user registration request exist
      let userDetails = JSON.parse(userBuffer.toString())
      userDetails.upGradCoins = 0
      let approvedUserBuffer = await ctx.stub
        .getState(approvedUserKey)
        .catch((err) => console.log(err))
      try {
        //check if the user is already approved in the network
        let approvedUserData = JSON.parse(approvedUserBuffer.toString())
        return 'This user is already approved and  registered in the network'
      } catch (err) {
        let dataBuffer = Buffer.from(JSON.stringify(userDetails))
        await ctx.stub.putState(approvedUserKey, dataBuffer)
        return userDetails
      }
    } catch (err) {
      return "This user request doesn't exist in the network"
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
      [name + '-' + aadharNumber],
    )
    let userBuffer = await ctx.stub
      .getState(approvedUserKey)
      .catch((err) => console.log(err))
    try {
      return JSON.parse(userBuffer.toString())
    } catch (err) {
      return "This user is either not approved or doesn't exist in the Registered network"
    }
  }

  /**
    * Create a new property on the network
    * @param ctx - The transaction context object
    * @param name - Name of the user
    * @return - returns new user object type
    */

  async approvePropertyRegistration(ctx, propertyId) {
    if (ctx.clientIdentity.getMSPID() != 'registrarMSP') {
      return "Registrar's can only approve user or property request"
    }
    const propertyKey = ctx.stub.createCompositeKey(
      'org.property-registration-network.regnet.requestPropertyKey',
      [propertyId],
    )
    let propertyDetails = await ctx.stub
      .getState(propertyKey)
      .catch((err) => console.log(err))
    try {
      //checking if the property request is in the network
      let propertyBuffer = JSON.parse(propertyDetails.toString())
      const approvedPropertyKey = ctx.stub.createCompositeKey(
        'org.property-registration-network.regnet.approvedPropertyKey',
        [propertyId],
      )
      let approvedPropertyDetails = await ctx.stub
        .getState(approvedPropertyKey)
        .catch((err) => console.log(err))
      try {
        //checking if the property is already approved
        let approvedPropertyBuffer = JSON.parse(
          approvedPropertyDetails.toString(),
        )
        return 'Property is already registered in the network, denying duplicate transcations'
      } catch (err) {
        await ctx.stub.putState(approvedPropertyKey, propertyDetails)
        return propertyBuffer
      }
    } catch (err) {
      return "Property doesn't exist in the network"
    }
  }

 /**
 * View approved property
 * @param ctx - The transaction context object
 * @param propertyId - unique ID
 * @return - returns property obj
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
      return "This property is either not approved or doesn't exist in the network"
    }
  }
}
module.exports = RegistrarContract
