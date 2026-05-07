import type { StructureBuilder, StructureResolver } from 'sanity/structure'
import {
  HomepageList,
  HeaderList,
  FooterList,
  SettingsList,
} from '../components/language-filtered-list'
import { iconForSlot } from '../icons'

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

// Document types that should not appear in the default list.
// `studioIcons` is intentionally hidden — editors edit it via right-click on
// any icon in the Studio (the IconConfigProvider keeps it live across the UI).
const EXCLUDED_TYPES = [
  'homepage',
  'header',
  'footer',
  'settings',
  'studioIcons',
  'assist.instruction.context',
]

export const structure: StructureResolver = (S: StructureBuilder) =>
  S.list()
    .title('Content')
    .items([
      // Pages Section
      S.listItem()
        .title('Homepage')
        .icon(iconForSlot('homepage'))
        .child(S.component(HomepageList).id('homepage-list')),

      // TODO: Add more pages here as you create them
      // Example:
      // S.listItem()
      //   .title("About Page")
      //   .icon(iconForSlot("aboutPage"))
      //   .child(S.component(AboutPageList).id("about-page-list")),

      // Globals and Settings Section

      S.listItem()
        .title('Globals and Settings')
        .icon(iconForSlot('globalsAndSettings'))
        .child(
          S.list()
            .title('Globals and Settings')
            .items([
              S.listItem()
                .title('Header')
                .icon(iconForSlot('header'))
                .child(S.component(HeaderList).id('header-list')),
              S.listItem()
                .title('Footer')
                .icon(iconForSlot('footer'))
                .child(S.component(FooterList).id('footer-list')),
              S.listItem()
                .title('Settings')
                .icon(iconForSlot('settings'))
                .child(S.component(SettingsList).id('settings-list')),
              ...S.documentTypeListItems().filter(
                (listItem: any) => !EXCLUDED_TYPES.includes(listItem.getId()),
              ),
            ]),
        ),
    ])
