import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSelector = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <select
      name="language"
      className="outline-none"
      id="language"
      onChange={(e) => {
        changeLanguage(e.target.value);
      }}
      value={i18n.language}
    >
      <option value="en">English</option>
      <option value="hi">हिंदी</option>
      {/* <option value="ta">தமிழ்</option> */}
      <option value="ka">ಕನ್ನಡ</option>
      {/* <option value="ml">മലയാളം</option> */}
      {/* <option value="be">বাংলা</option> */}
      {/* <option value="pu">ਪੰਜਾਬੀ</option> */}
    </select>
  );
};

export default LanguageSelector; 