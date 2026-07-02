exports.maskPhone = (phone) => {
  if (!phone) return '';
  const c = phone.replace(/\s/g, '');
  if (c.startsWith('+234') && c.length >= 13)
    return `${c.slice(0,8)} ***${c.slice(-4)}`;
  if (c.length >= 11) return `${c.slice(0,4)}***${c.slice(-4)}`;
  return phone;
};

exports.randomNigerianPhone = () => {
  const prefixes = ['0803','0805','0806','0807','0810','0812','0813','0906','0907','0901','0902','0903','0912'];
  const p = prefixes[Math.floor(Math.random() * prefixes.length)];
  const n = Math.floor(Math.random() * 9000000 + 1000000);
  return `+234 ${p.slice(1)} ${String(n).slice(0,3)} ${String(n).slice(3)}`;
};
