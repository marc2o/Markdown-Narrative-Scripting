# Markdown Narrative Scripting

This is a very simple _Markdown Narrative Scripting_ (short MDNS) engine. More of a proof-of-concept than anything else. I wanted something like [Ink](https://github.com/inkle/ink), but even simpler.

The `demo/` files illustrate how this is intended to be used.

## Writing Narrative Scripts

It is really simple. Open your favorite Markdown editor (mine are Zettlr and iA Writer) and write your text. You can certainly format your text using `**` or `__` for bold and `*` or `_` for italic text. Images work, too (`![some text that is ignored](path/to/image)`).

**Headings** (`# .. ### My Heading Text`) always introduce sections, regardless of their level.

These can be linked to in **Choices** (sort of dialogue options), which should placed at the end of a section in the form of links in an unordered list (`- [Choice text](section-heading)` — note the absence of the `#`, usually used for internal anchors). Thus, the user chooses how (or rather in which section) the »story« continues.

These IDs are formed from the headings (like on GitHub), with all the spaces replaced by dashes and the letters transformed to lowercase (i. e. `## My wonderful section` can be linked to using `my-wonderful-section`.

## To do

- Implementing more Markdown options, such as `~~del~~`…
- Variables and basic math operations
- …