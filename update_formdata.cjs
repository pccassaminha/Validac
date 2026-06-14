const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add observacoes to formData state initialization
content = content.replace(
  `  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    area: "",
    province: "Luanda",
    customProvince: "",
    quantity: 1,
  });`,
  `  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    area: "",
    province: "Luanda",
    customProvince: "",
    observacoes: "",
    quantity: 1,
  });`
);

// 2. Add observacoes to tempLead
content = content.replace(
  `    const tempLead = {
      name: formData.name,
      phone: formData.phone,
      address: formData.area || "", // Bairro/Zona/Município mapping
      province:
        formData.province === "Outra"
          ? formData.customProvince
          : formData.province,
      area: formData.area || "", // Bairro/Zona
      produto: produtoName,
      totalPrice: formData.quantity * pricePerUnit,
      quantity: formData.quantity,`,
  `    const tempLead = {
      name: formData.name,
      phone: formData.phone,
      address: formData.area || "", // Bairro/Zona/Município mapping
      province:
        formData.province === "Outra"
          ? formData.customProvince
          : formData.province,
      area: formData.area || "", // Bairro/Zona
      observacoes: formData.observacoes,
      produto: produtoName,
      totalPrice: formData.quantity * pricePerUnit,
      quantity: formData.quantity,`
);

fs.writeFileSync('src/App.tsx', content);
console.log('App.tsx updated for formData');
