import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router";
import { GetUserQuery } from "../api/user";
import { useTranslation } from 'react-i18next';

function Navbar() {
  const { t } = useTranslation();
  const data = GetUserQuery();
  const [user, setuser] = useState();
  useEffect(() => {
    setuser(data.data);
  }, [data.data]);
  const navigate = useNavigate();
  return (
    <div className="sticky top-0 z-50">
      <div className=" bg-zinc-700   p-4 ">
        <div className="flex justify-between ">
          <div>
            <a href="/">
              <h1 className="text-2xl font-bold text-white">E-learning platform</h1>
            </a>
          </div>
          <div>
            <ul className="flex space-x-4 text-white">
              {user ? (
                <h1>{t('sidebar_hello')} {user?.name} </h1>
              ) : (
                <Link to="/login">{t('nav_login')}</Link>
              )}
              {user?.role === "mentor" ? (
                <Link to="/mentor/Meetings">{t('sidebar_personal_meetings')}</Link>
              ) : (
                <Link to="/user/book-meeting">{t('book_meeting', 'Book a Call')}</Link>
              )}

              {user ? (
                <li
                  onClick={() => {
                    localStorage.removeItem("token");
                    navigate("/login");
                  }}
                  className="font-bold hover:cursor-pointer"
                >
                  {t('nav_logout')}
                </li>
              ) : (
                ""
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
