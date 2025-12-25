import { Routes } from '@angular/router';
import { App } from './app';
import { Project } from './project/project';

export const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'project/:name',
                component: Project
            }
        ]
    }
];
