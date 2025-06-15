/**
 * © 2025 Northern Pacific Technologies, LLC. All Rights Reserved. 
 *  
 * For license details, see the LICENSE file in this project root.
 */
/**
 * © 2025 Northern Pacific Technologies, LLC. All Rights Reserved. 
 *  
 * For license details, see the LICENSE file in this project root.
 */
import { inject, Injectable } from '@angular/core'
import { MatSnackBar } from '@angular/material/snack-bar'
import { IRefTables } from '@shared/models'
import { BaseService, EnvironmentService } from '@shared/services';

@Injectable({
  providedIn: 'root',
})
export class RefTablesService extends BaseService<IRefTables> {

  constructor() {
    const environmentService = inject(EnvironmentService);
    const snackBar = inject(MatSnackBar);
    super(environmentService.apiUrl + '/ref-tables', snackBar);
  }
}