'use strict';

require('dotenv').config();

const { Selector } = require('testcafe');

let uiExperience = null;
const landingPages = {
	classic: ['/home/home.jsp', '/setup/forcecomHomepage.apexp'],
	lightning: ['/one/one.app']
};

fixture('Test Org')
	.page('https://login.salesforce.com/')
	.beforeEach(async t => {
		if (!process.env.TEST_ORG_USERNAME)
			throw Error('TEST_ORG_USERNAME environment variable not set in .env file');
		if (!process.env.TEST_ORG_PASSWORD)
			throw Error('TEST_ORG_PASSWORD environment variable not set in .env file');

		await t
			.typeText('#username', process.env.TEST_ORG_USERNAME)
			.typeText('#password', process.env.TEST_ORG_PASSWORD)
			.click('#Login');

		const classicHeader = Selector('#phHeader');
		const lightningHeader = Selector('#oneHeader');

		// Await element in DOM and visibility check
		const [classicHeaderElement, lightningHeaderElement] = await Promise.all([
			classicHeader.with({ visibilityCheck: true })(),
			lightningHeader.with({ visibilityCheck: true })()
		]);

		if (lightningHeaderElement) {
			uiExperience = 'lightning';
		}

		if (classicHeaderElement) {
			uiExperience = 'classic';
		}
		await t.expect(uiExperience).notEql(null, 'Unknown UI Experience or failed to login');
	});

test('UI has Setup Link', async t => {
	let setupLinkSelector;
	if (uiExperience === 'classic') {
		setupLinkSelector = await Selector('#setupLink');
	}
	if (uiExperience === 'lightning') {
		setupLinkSelector = await Selector('div.setupGear');
	}
	const setupLinkElement = await setupLinkSelector.with({ visibilityCheck: true })();
	await t.expect(setupLinkSelector.exists).ok();
});

test('Validate Org ID', async t => {
	const location = await t.eval(() => window.location);
	let companyInfoLink;
	let orgIdElement;
	let orgIdSelector;
	if (uiExperience === 'lightning') {
		companyInfoLink = location.origin + '/one/one.app#/setup/CompanyProfileInfo/home';
		await t.navigateTo(companyInfoLink);
		orgIdSelector = await Selector('table.detailList')
			.find('td.dataCol')
			.withText(process.env.TEST_ORG_ID);
	}
	if (uiExperience === 'classic') {
		companyInfoLink = location.origin + '/setup/forcecomHomepage.apexp';
		await t
			.navigateTo(companyInfoLink)
			.click('#CompanyProfile_font')
			.click('#CompanyProfileInfo_font');

		orgIdSelector = await Selector('table.detailList')
			.find('td.dataCol')
			.withText(process.env.TEST_ORG_ID);
	}

	await t.expect(orgIdSelector.exists).ok();
	await t.expect(orgIdSelector.innerText).eql(process.env.TEST_ORG_ID);
});
