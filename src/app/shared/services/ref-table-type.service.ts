/**
 * © 2025 Northern Pacific Technologies, LLC. All Rights Reserved. 
 *  
 * For license details, see the LICENSE file in this project root.
 */
import { inject, Injectable } from '@angular/core'
import { MatSnackBar } from '@angular/material/snack-bar'
import { IRefTableType } from '@shared/models'
import { BaseService, EnvironmentService } from '@shared/services';

@Injectable({
  providedIn: 'root',
})
export class RefTableTypeService extends BaseService<IRefTableType> {

  constructor() {
    const environmentService = inject(EnvironmentService);
    const snackBar = inject(MatSnackBar);
    super(environmentService.apiUrl + '/ref-table-type', snackBar);
  }
}