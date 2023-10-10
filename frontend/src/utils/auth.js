export const auth = async () => {
  const token = await JSON.parse(localStorage.getItem("token"));
  if (!token) {
  return false;
  } else {return true}
  };
  

  