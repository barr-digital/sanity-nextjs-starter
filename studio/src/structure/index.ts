import {CogIcon, HomeIcon, EarthGlobeIcon, ArrowUpIcon, ArrowDownIcon} from '@sanity/icons'
import type {StructureBuilder, StructureResolver} from 'sanity/structure'
import {
  HomepageList,
  HeaderList,
  FooterList,
  SettingsList,
} from '../components/LanguageFilteredList'

/**
 * Custom Studio structure with organized sections
 *
 * TODO: Customize this structure as you add new document types
 * - Add new pages to the "Pages" section
 * - Add new singletons to the "Globals" section
 * - Remove document types you don't need
 *
 * Learn more: https://www.sanity.io/docs/structure-builder-introduction
 */

// Document types that should not appear in the default list
const EXCLUDED_TYPES = ['homepage', 'header', 'footer', 'settings', 'assist.instruction.context']

export const structure: StructureResolver = (S: StructureBuilder) =>
  S.list()
    .title('Content')
    .items([
      // Pages Section
      S.listItem()
        .title('Homepage')
        .icon(HomeIcon)
        .child(S.component(HomepageList).id('homepage-list')),

      // TODO: Add more pages here as you create them
      // Example:
      // S.listItem()
      //   .title("About Page")
      //   .icon(UserIcon)
      //   .child(S.component(AboutPageList).id("about-page-list")),

      // Globals and Settings Section

      S.listItem()
        .title('Globals and Settings')
        .icon(EarthGlobeIcon)
        .child(
          S.list()
            .title('Globals and Settings')
            .items([
              S.listItem()
                .title('Header')
                .icon(ArrowUpIcon)
                .child(S.component(HeaderList).id('header-list')),
              S.listItem()
                .title('Footer')
                .icon(ArrowDownIcon)
                .child(S.component(FooterList).id('footer-list')),
              S.listItem()
                .title('Settings')
                .icon(CogIcon)
                .child(S.component(SettingsList).id('settings-list')),
              ...S.documentTypeListItems().filter(
                (listItem: any) => !EXCLUDED_TYPES.includes(listItem.getId()),
              ),
            ]),
        ),
    ])
