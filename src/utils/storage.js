export const dersleriKaydet = (dersler) => {
  localStorage.setItem("dersler", JSON.stringify(dersler));
};

export const dersleriYukle = () => {
  const veri = localStorage.getItem("dersler");

  if (veri) {
    return JSON.parse(veri);
  } else {
    return [];
  }
};
