import React from "react";

import * as styles from "./tables.module.css";

export const Table1 = () => {
  return (
    <table className={styles.colorTable}>
      <thead>
        <tr>
          <th className={styles.gray}></th>
          <th className={styles.green}>
            old cluster 0 (green) <br />
            [A, C, D, E, F, G, K, L]
          </th>
          <th className={styles.orange}>
            old cluster 1 (orange) <br />
            [B, H, I, J]
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th className={styles.gray}>
            new cluster 0 <br />
            [B, C, H, I, J]
          </th>
          <td>
            1 overlapping card <br />
            [C]
          </td>
          <td>
            4 overlapping cards <br />
            [B, H, I, J]
          </td>
        </tr>
        <tr>
          <th className={styles.gray}>
            new cluster 1 <br />
            [E, G, L]
          </th>
          <td>
            3 overlapping cards <br />
            [E, G, L]
          </td>
          <td>0 overlapping cards</td>
        </tr>
        <tr>
          <th className={styles.gray}>
            new cluster 2 <br />
            [A, D, F, K]
          </th>
          <td>
            4 overlapping cards <br />
            [A, D, F, K]
          </td>
          <td>0 overlapping cards</td>
        </tr>
      </tbody>
    </table>
  );
};

export const Table2 = () => {
  return (
    <table className={styles.colorTable}>
      <thead>
        <tr>
          <th className={styles.gray}></th>
          <th className={styles.green}>old cluster 0 (green)</th>
          <th className={styles.orange}>old cluster 1 (orange)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th className={styles.orange}>new cluster 0 (orange)</th>
          <td>1</td>
          <td className={styles.orange}>
            <strong>4</strong>
          </td>
        </tr>
        <tr>
          <th className={styles.purple}>new cluster 1 (purple)</th>
          <td>3</td>
          <td>0</td>
        </tr>
        <tr>
          <th className={styles.green}>new cluster 2 (green)</th>
          <td className={styles.green}>
            <strong>4</strong>
          </td>
          <td>0</td>
        </tr>
      </tbody>
    </table>
  );
};

export const Table3 = () => {
  return (
    <table className={styles.colorTable}>
      <thead>
        <tr>
          <th className={styles.gray}></th>
          <th className={styles.green}>old cluster 0 (green)</th>
          <th className={styles.orange}>old cluster 1 (orange)</th>
          <th className={styles.purple}>(unused)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th className={styles.orange}>new cluster 0 (orange)</th>
          <td>MAX_CARDS - 1</td>
          <td className={styles.orange}>MAX_CARDS - 4</td>
          <td>0</td>
        </tr>
        <tr>
          <th className={styles.purple}>new cluster 1 (purple)</th>
          <td>MAX_CARDS - 3</td>
          <td>MAX_CARDS - 0</td>
          <td>0</td>
        </tr>
        <tr>
          <th className={styles.green}>new cluster 2 (green)</th>
          <td className={styles.green}>MAX_CARDS - 4</td>
          <td>MAX_CARDS - 0</td>
          <td>0</td>
        </tr>
      </tbody>
    </table>
  );
};
