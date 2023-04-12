import React from "react";

import * as styles from "./tables.module.css";

export const Table1 = () => {
  return (
    <div className={styles.colorTable}>
      <table>
        <thead>
          <tr>
            <td className={styles.gray}></td>
            <th className={styles.green}>
              old&nbsp;cluster&nbsp;0 (green)
              <br />
              [A,&nbsp;C,&nbsp;D,&nbsp;E,&nbsp;F,&nbsp;G,&nbsp;K,&nbsp;L]
            </th>
            <th className={styles.orange}>
              old&nbsp;cluster&nbsp;1 (orange)
              <br />
              [B,&nbsp;H,&nbsp;I,&nbsp;J]
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th className={styles.gray}>
              new&nbsp;cluster&nbsp;0
              <br />
              [B,&nbsp;C,&nbsp;H,&nbsp;I,&nbsp;J]
            </th>
            <td>
              1&nbsp;overlapping card
              <br />
              [C]
            </td>
            <td>
              4&nbsp;overlapping cards
              <br />
              [B,&nbsp;H,&nbsp;I,&nbsp;J]
            </td>
          </tr>
          <tr>
            <th className={styles.gray}>
              new&nbsp;cluster&nbsp;1
              <br />
              [E,&nbsp;G,&nbsp;L]
            </th>
            <td>
              3&nbsp;overlapping cards
              <br />
              [E,&nbsp;G,&nbsp;L]
            </td>
            <td>0&nbsp;overlapping cards</td>
          </tr>
          <tr>
            <th className={styles.gray}>
              new&nbsp;cluster&nbsp;2
              <br />
              [A,&nbsp;D,&nbsp;F,&nbsp;K]
            </th>
            <td>
              4&nbsp;overlapping cards
              <br />
              [A,&nbsp;D,&nbsp;F,&nbsp;K]
            </td>
            <td>0 overlapping cards</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export const Table2 = () => {
  return (
    <div className={styles.colorTable}>
      <table>
        <thead>
          <tr>
            <td className={styles.gray}></td>
            <th className={styles.green}>old&nbsp;cluster&nbsp;0 (green)</th>
            <th className={styles.orange}>old&nbsp;cluster&nbsp;1 (orange)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th className={styles.orange}>new&nbsp;cluster&nbsp;0 (orange)</th>
            <td>1</td>
            <td className={styles.orange}>
              <strong>4</strong>
            </td>
          </tr>
          <tr>
            <th className={styles.purple}>new&nbsp;cluster&nbsp;1 (purple)</th>
            <td>3</td>
            <td>0</td>
          </tr>
          <tr>
            <th className={styles.green}>new&nbsp;cluster&nbsp;2 (green)</th>
            <td className={styles.green}>
              <strong>4</strong>
            </td>
            <td>0</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export const Table3 = () => {
  return (
    <div className={styles.colorTable}>
      <table>
        <thead>
          <tr>
            <td className={styles.gray}></td>
            <th className={styles.green}>old&nbsp;cluster&nbsp;0 (green)</th>
            <th className={styles.orange}>old&nbsp;cluster&nbsp;1 (orange)</th>
            <th className={styles.purple}>(unused)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th className={styles.orange}>new&nbsp;cluster&nbsp;0 (orange)</th>
            <td>MAX_CARDS&nbsp;-&nbsp;1</td>
            <td className={styles.orange}>MAX_CARDS&nbsp;-&nbsp;4</td>
            <td>0</td>
          </tr>
          <tr>
            <th className={styles.purple}>new&nbsp;cluster&nbsp;1 (purple)</th>
            <td>MAX_CARDS&nbsp;-&nbsp;3</td>
            <td>MAX_CARDS&nbsp;-&nbsp;0</td>
            <td>0</td>
          </tr>
          <tr>
            <th className={styles.green}>new&nbsp;cluster&nbsp;2 (green)</th>
            <td className={styles.green}>MAX_CARDS&nbsp;-&nbsp;4</td>
            <td>MAX_CARDS&nbsp;-&nbsp;0</td>
            <td>0</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export const WikipediaTable = () => {
  return (
    <div className={styles.colorTable}>
      <table>
        <thead>
          <tr>
            <td></td>
            <th>Clean bathroom</th>
            <th>Sweep floors</th>
            <th>Wash windows</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>Alice</th>
            <td>
              <strong>$8</strong>
            </td>
            <td>$4</td>
            <td>$7</td>
          </tr>
          <tr>
            <th>Bob</th>
            <td>$5</td>
            <td>$2</td>
            <td>
              <strong>$3</strong>
            </td>
          </tr>
          <tr>
            <th>Dora</th>
            <td>$9</td>
            <td>
              <strong>$4</strong>
            </td>
            <td>$8</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
