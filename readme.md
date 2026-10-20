# fackforbund.github.io

A directory of Swedish trade unions (fackförbund). Each union has a page at
`fackforbund.github.io/[slug]` showing the union's name, logo, and the
collective agreements (kollektivavtal) it is a signatory of, linking to
`kollektivavtal.github.io/[year]/[slug]`.

## Content structure

Each union lives in its own directory containing a markdown file and logo
images:

```
unionen/
  unionen.md
  unionen@512x512.png
  ...
```

The markdown file is parsed by `app/[slug]/page.tsx` to populate the page.

## License

[CC-0](https://github.com/fackforbund/fackforbund.github.io/blob/main/license)
