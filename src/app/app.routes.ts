// import { Routes } from '@angular/router';
// import { Login } from './auth/login/login';
// import { MainContent } from './main-content/main-content';
// import { Activitiesproject } from './activitiesproject/activitiesproject';
// import { Projects } from './projects/projects';
// import { Dashboard } from './dashboard/dashboard';

// export const routes: Routes = [
//   {
//     path: 'login',
//     component: Login
//   },
//   {
//     path: 'dashboard',
//     component: MainContent,
//     children: [
//       {
//         path: '',
//         component: Dashboard
//       },
//       {
//         path: 'projects',
//         component: Projects,
//         children: [
//           {
//             path: 'activity/:id',
//             component: Activitiesproject
//           }
//         ]
//       },

//     ]
//   },
//   // {
//   //   path: '',
//   //   redirectTo: '/login',
//   //   pathMatch: 'full'
//   // }
// ];


import { Routes } from '@angular/router';
import { Login } from './auth/login/login';
import { MainContent } from './main-content/main-content';
import { Activitiesproject } from './activitiesproject/activitiesproject';
import { Projects } from './projects/projects';
import { Dashboard } from './dashboard/dashboard';

export const routes: Routes = [
  {
    path: 'login',
    component: Login
  },
  {
    path: 'dashboard',
    component: MainContent,
    children: [
      {
        path: '',
        component: Dashboard
      },
      {
        path: 'projects',
        component: Projects,
      },
      {
        path: 'project-activities/:id',
        component: Activitiesproject
      },
      
    ]
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  }
];