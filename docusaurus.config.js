// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import { themes as prismThemes } from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Best FD India',
  favicon: 'img/logo.svg',

  // Set the production url of your site here
  url: 'https://bestfd.in',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',
  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        gtag: {
          trackingID: 'G-H40VZWZV1L',
          anonymizeIP: true,
        },
        sitemap: {
          lastmod: 'date',
          changefreq: 'daily',
          priority: 0.5,
          ignorePatterns: ['/tags/**'],
          filename: 'sitemap.xml',
          createSitemapItems: async (params) => {
            const { defaultCreateSitemapItems, ...rest } = params;
            const items = await defaultCreateSitemapItems(rest);
            return items
              .filter((item) => !item.url.includes('/docs/'))
              .filter((item) => !item.url.includes('/blog/'));
          },
        }, theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      navbar: {
        title: 'Best FD',
        items: [{
          type: 'dropdown',
          label: 'My Projects',
          position: 'left',
          items: [
            {
              label: 'Points Nerd India',
              href: 'https://pointsnerd.in',
            },
            {
              label: 'PDF Password Remover',
              href: 'https://pdfpasswordremover.cc'
            }
          ],
        },
        {
          href: 'https://github.com/ameyakarve/bestfd',
          label: 'Github',
          position: 'right',
          target: '_self',
        },{
          href: 'javascript:(navigator.share && navigator.share({url:window.location.href})) || (  navigator.clipboard.writeText(window.location.href))',
          label: 'Share',
          position: 'right',
          className: 'button button--secondary button--lg',
          target: '_self',
        },],
        logo: {
          alt: 'My Site Logo',
          src: 'img/logo.svg',
        },
        hideOnScroll: true,
        style: 'dark'
      },
      metadata: [
        {name: 'description', content: 'Compare the best fixed deposit (FD) interest rates from top banks in real-time. Our free tool helps you maximize your savings with up-to-date rates, easy comparisons, and smart investment recommendations.'}
      ],
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.github,
      },
      colorMode: {
        defaultMode: 'light',
        disableSwitch: true,
        respectPrefersColorScheme: false,
      },
    }),
};

export default config;
