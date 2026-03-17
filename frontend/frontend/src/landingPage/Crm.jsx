import { useEffect,useState } from "react";
import "./Crm.css";

function Crm() {
  const [crmData, setCrmData] = useState(null);

  return Crm(
<div className="crm-container">
      <h1>Human Resource Management system (CRM)</h1>
      <p>Manage your customer interactions and data effectively.</p>
    </div>


  );         
}
export default Crm;