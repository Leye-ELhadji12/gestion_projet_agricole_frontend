import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { MainContent } from './main-content/main-content';
import { Activitiesproject } from './activitiesproject/activitiesproject';
import { Projects } from './projects/projects';
import { Dashboard } from './dashboard/dashboard';
import { Users } from './users/users';

export const routes: Routes = [
  {
    path: 'login',
    component: Login
  },
  {
    path: 'projects-management',
    component: MainContent,
    children: [
      {
        path: 'dashboard',
        component: Dashboard
      },
      {
        path: 'projects',
        component: Projects,
      },
      {
        path: 'project-activities/:id/:name',
        component: Activitiesproject
      },
      {
        path: 'users',
        component: Users
      }
    ]
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  }
];
