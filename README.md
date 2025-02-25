# FurtherV's Token Tooltips

Displays a configurable tooltip when you hover over a token!

The configuration can be adjusted by the GM.
Players can toggle whether they want to see tooltips or not using a setting or a button on the left sidebar.

When you choose the `code` type for a tooltip row, your code gets the following arguments:

- `this`, `model`: The data model for the row
- `token`: The token **document** that is being hovered
- `actor`: The actor that is being hovered
- `shortcuts`: All entries in `CONFIG["furtherv-token-tooltips"].shortcuts` which can be used as code simplifcations. Can be modified using JS as well!
