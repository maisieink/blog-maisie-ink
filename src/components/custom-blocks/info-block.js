import React from "react";

import * as styles from "./info-block.module.css";

const InfoBlock = ({ children }) => (
  // .custom-block defined in typography.js
  <div className="custom-block">
    <div className={styles.infoBlock}>{children}</div>
  </div>
);

export default InfoBlock;
