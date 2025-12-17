import { Routes } from '@angular/router';
import { App } from './app';
import { Project } from './project/project';

export const routes: Routes = [
    {
        path: '',
        component: App,
        children: [
            {
                path: 'project/:id',
                component: Project
            }
        ]
    }
];
