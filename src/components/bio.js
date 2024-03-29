/**
 * Bio component that queries for data
 * with Gatsby's useStaticQuery component
 *
 * See: https://www.gatsbyjs.com/docs/how-to/querying-data/use-static-query/
 */

import * as React from "react"
import { useStaticQuery, graphql } from "gatsby"
import { StaticImage } from "gatsby-plugin-image"

const Bio = () => {
  const data = useStaticQuery(graphql`
    query BioQuery {
      site {
        siteMetadata {
          author {
            name
            summary
          }
          social {
            twitter
          }
        }
      }
    }
  `)

  // Set these values by editing "siteMetadata" in gatsby-config.js
  const author = data.site.siteMetadata?.author
  const social = data.site.siteMetadata?.social

  return (
    <div className="bio">
      <StaticImage
        className="bio-avatar"
        formats={["auto", "webp", "avif"]}
        src="../images/me.jpg"
        width={250}
        quality={95}
        alt="Profile picture"
      />
      {author?.name && (
        <p>
          Written by <strong>{author.name}</strong> {author?.summary || null}
          {` `}
          You should follow him on <a href={`https://github.com/${social?.github || ``}`}>Github</a>
          , <a href={`https://www.linkedin.com/in/${social?.linkedin || ``}`}>Linkedin</a>
          , or <a href={`https://www.twitter.com/${social?.twitter || ``}`}>Twitter</a>
        </p>
      )}
    </div>
  )
}

export default Bio
