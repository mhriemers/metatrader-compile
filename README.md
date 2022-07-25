# Action for Running MetaTrader Compiler

[![Build and Test](https://github.com/mhriemers/metatrader-compile/actions/workflows/test.yml/badge.svg)](https://github.com/mhriemers/metatrader-compile/actions/workflows/test.yml)

The [Run MetaTrader Compiler](#run-metatrader-compiler) action enables you to compile Expert Advisors and Indicators on a [self-hosted](https://docs.github.com/en/actions/hosting-your-own-runners/about-self-hosted-runners) or [GitHub-hosted](https://docs.github.com/en/actions/using-github-hosted-runners/about-github-hosted-runners) runner.

## Usage Example

Use the **Run MetaTrader Compiler** action to compile Expert Advisors and Indicators. The following example assumes an `MQL4` directory in the root of the project.

```yaml
name: Compile Expert Advisor
on: [push]
jobs:
  my-job:
    name: Compile Expert Advisor
    runs-on: windows-latest
    steps:
      - name: Check out repository
        uses: actions/checkout@v3
      - name: Set up MetaTrader
        uses: mhriemers/setup-metatrader@v1
        with:
          version: 4
      - name: Compile Expert Advisor
        uses: mhriemers/metatrader-compile@v1
        with:
          files: |
            MQL4/Experts/ExampleExpert.mq4
```

## Run MetaTrader Compiler

When you define your workflow in the `.github/workflows` directory of your repository, specify the **Run MetaTrader Compiler** action as `mhriemers/metatrader-compile@v1`. The action accepts the following input.

| Input     | Description                                                                                                                                                                                                               |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `files`   | (Required) Expert Advisors and Indicators to compile. You can specify a single file or glob for compilation.                                                                                                              |
| `include` | (Optional) Additional MetaTrader installation directory to include for compilation. See the [MetaTrader documentation](https://www.metatrader5.com/en/metaeditor/help/beginning/integration_ide) about the folder layout. |

## License

MIT
