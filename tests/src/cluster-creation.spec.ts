/**********************************************************************
 * Copyright (C) 2024 Red Hat, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 ***********************************************************************/

import {
    ResourcesPage,
    expect as playExpect,
    ExtensionCardPage,
    RunnerOptions,
    test,
    ResourceConnectionCardPage,
} from '@podman-desktop/tests-playwright';
import { CreateResourcePage } from './model/pages/create-resource-page';

let extensionCard: ExtensionCardPage;
const extensionLabel = 'redhat.redhat-sandbox';
const extensionLabelName = 'redhat-sandbox';
const resourceCardLabel = 'redhat.sandbox';
const imageName = 'ghcr.io/redhat-developer/podman-desktop-sandbox-ext:latest';
const contextName = 'dev-sandbox-context-3';
const loginCommand = '';

test.use({
    runnerOptions: new RunnerOptions({ customFolder: 'sandbox-tests-pd', autoUpdate: false, autoCheckUpdates: false }),
});
test.beforeAll(async ({ runner, page, welcomePage }) => {
    runner.setVideoAndTraceName('sandbox-cluster-e2e');
    await welcomePage.handleWelcomePage(true);
    extensionCard = new ExtensionCardPage(page, extensionLabelName, extensionLabel);
});

test.afterAll(async ({ runner }) => {
    await runner.close();
});

test.describe.serial('Developer Sandbox cluster verification', () => {
    test('Install Sandbox extension', async ({ navigationBar }) => {
        const extensions = await navigationBar.openExtensions();
        if (!await extensions.extensionIsInstalled(extensionLabel)) {
            await extensions.installExtensionFromOCIImage(imageName);
            await playExpect(extensionCard.card).toBeVisible();
        }
    });

    test('Create Sandbox cluster', async ({navigationBar,page}) => {
        await navigationBar.openSettings();
        const resourcesPage = new ResourcesPage(page);
        playExpect(await resourcesPage.resourceCardIsVisible(resourceCardLabel)).toBeTruthy();

        await resourcesPage.goToCreateNewResourcePage(resourceCardLabel);
        const createResourcePage = new CreateResourcePage(page);
        await createResourcePage.createResource(loginCommand, contextName);
    });

    test('Verify Sandbox cluster', async({page}) => {
        const sandboxClusterCard = new ResourceConnectionCardPage(page, resourceCardLabel, contextName);
        playExpect(await sandboxClusterCard.doesResourceElementExist()).toBeTruthy();
        await playExpect(sandboxClusterCard.resourceElementConnectionStatus).toHaveText('RUNNING');
    });

    test('Delete remote cluster context', async({[page]}) => {
        //have to delete context
    });
});