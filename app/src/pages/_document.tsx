import React from "react"

import Document, {
  Html,
  Head,
  Main,
  NextScript,
  DocumentContext,
} from "next/document"

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx)
    return { ...initialProps }
  }

  render() {
    return (
      <Html>
        <Head>
          {/* No description meta here: next/document's <Head> renders on
              every page unconditionally and next/head does not dedupe plain
              <meta> tags, so a "fallback" here would just duplicate the
              page-specific one each route sets itself (see Header/SeoHead). */}
          <link rel="describedby" href="https://www.free4.chat/llms.txt" />
          <link rel="icon" href="/favicon.ico" />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
            rel="stylesheet"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
