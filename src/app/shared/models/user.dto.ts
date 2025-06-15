/**
 * © 2025 Northern Pacific Technologies, LLC. All Rights Reserved. 
 *  
 * For license details, see the LICENSE file in this project root.
 */
export interface IUser {
  id: string
  idRtTimeZone: string
  email: string
  lastName: string
  phone: string
  state: string
  street1: string
  street2: string
  termsAccepted: Date
  city: string
  zipCode: string
  firstName: string
  createdAt: Date
  createdBy: string
  updatedAt: Date
  updatedBy: string
  isActive: boolean
}