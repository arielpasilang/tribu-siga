import { PortableText as BasePortableText } from "@portabletext/react"

const components = {
  marks: {
    link: ({ value, children }) => (
      <a href={value?.href} rel="noreferrer">
        {children}
      </a>
    ),
  },
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

const PortableText = ({ value }) => {
  if (!value?.length) return null
  return <BasePortableText value={value} components={components} />
}

export default PortableText
