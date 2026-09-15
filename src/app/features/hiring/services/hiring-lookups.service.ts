import { Injectable, inject } from '@angular/core';
import { forkJoin, Observable, map } from 'rxjs';

import { DepartmentService } from '../../../core/services/department.service';
import { DesignationService } from '../../../core/services/designation.service';
import { EmployeeService } from '../../../core/services/employee.service';

import { Department } from '../../../models/department.model';
import { Designation } from '../../../models/designation.model';
import { Employee } from '../../../models/employee.model';

export interface HiringLookups {
  departments: Department[];
  designations: Designation[];
  managers: Employee[];
}

@Injectable({
  providedIn: 'root'
})
export class HiringLookupService {

  private readonly departmentService =
    inject(DepartmentService);

  private readonly designationService =
    inject(DesignationService);

  private readonly employeeService =
    inject(EmployeeService);

  getLookups(): Observable<HiringLookups> {
    return forkJoin({
      departments: this.departmentService.getAll(),
      designations: this.designationService.getAll(),
      managers: this.employeeService.getManagers()
    }).pipe(
      map(response => ({
        departments: response.departments.data ?? [],
        designations: response.designations.data ?? [],
        managers: response.managers.data ?? []
      }))
    );
  }
}