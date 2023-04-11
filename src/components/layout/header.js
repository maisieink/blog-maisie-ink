import React from "react";
import { Link, useStaticQuery, graphql } from "gatsby";
import { GatsbyImage } from "gatsby-plugin-image";

import ThemeToggleButton from "./theme-toggle-button";

import * as styles from "./header.module.css";
import Gooey, { useMouseEventContainer } from "./gooey";

const Header = ({ className, minimal }) => {
  const data = useStaticQuery(graphql`
    query {
      site {
        siteMetadata {
          firstName
          lastName
          shortDescription
          githubUrl
          aboutMeUrl
        }
      }
      bioImage: file(relativePath: { eq: "maisie-johnson.jpg" }) {
        childImageSharp {
          gatsbyImageData(
            layout: FIXED
            width: 64
            height: 64
            placeholder: BLURRED
          )
        }
      }
    }
  `);

  const { firstName, lastName, shortDescription, githubUrl, aboutMeUrl } =
    data.site.siteMetadata;

  const { containerProps, gooeyProps } = useMouseEventContainer();

  return (
    <header className={className}>
      <div className={styles.siteTitle} {...containerProps}>
        <Link to="/" className={styles.siteTitleLink}>
          <div className={styles.firstName}>
            <div className={styles.circleBackground}>
              <Gooey color="pink" {...gooeyProps} />
            </div>
            <span className={styles.text}>{firstName}</span>
          </div>{" "}
          <div className={styles.lastName}>
            <div className={styles.circleBackground}>
              <Gooey color="blue" {...gooeyProps} />
            </div>
            <span className={styles.text}>{lastName}</span>
          </div>
        </Link>
      </div>

      {!minimal && (
        <div className={styles.bio}>
          <GatsbyImage
            className={styles.bioImage}
            image={data.bioImage.childImageSharp.gatsbyImageData}
            alt="photo of Maisie"
          />
          <div>
            <div>
              {shortDescription} / <ThemeToggleButton />
            </div>
            <div className={styles.bioInfoLineLinks}>
              <a href={aboutMeUrl}>About me</a> / <a href={githubUrl}>GitHub</a>{" "}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
