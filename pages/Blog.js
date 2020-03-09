import React, { useState } from "react";
import DemoBlog from "../comps/DemoBlog";
import { BackTop, Skeleton } from "antd";
import api from "../api";

import styles from "../styles/styles.scss";
//Cambiar por la consulta a la base de datos

export default function Blog() {
  const [data, setData] = useState(null);

  function loadData() {
    api.get(`/api/post/?ordering=-created_at`).then(res => {
      console.log("Blog res: ", res.data);
      setData(res.data);
    });
  }

  return (
    <div style={{ paddingBottom: "50px" }}>
      <BackTop />
      <h1 className={styles.sectionTitle}>Blog</h1>
      {data ? (
        <DemoBlog post={data} demo={false} pagination={true} />
      ) : (
        <div className="container">
          <Skeleton active>{data == null ? loadData() : null} </Skeleton>
        </div>
      )}
    </div>
  );
}
