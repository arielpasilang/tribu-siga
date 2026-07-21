import * as React from "react"
import { PortableText as BasePortableText } from "@portabletext/react"

const components = {
  types: {
    image: ({ value }) => {
      if (!value?.asset?.url) return null
      const { width, height } = value.asset.metadata?.dimensions || {}
      return (
        <img
          src={value.asset.url}
          alt={value.alt || ""}
          width={width}
          height={height}
          loading="lazy"
          style={{ width: "100%", height: "auto" }}
        />
      )
    },
  },
}

const PortableText = ({ value }) => (
  <BasePortableText value={value} components={components} />
)

export default PortableText
