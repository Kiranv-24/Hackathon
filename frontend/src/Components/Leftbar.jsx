import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { GetUserQuery } from "../api/user";
import { RiDiscussFill } from "react-icons/ri";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import { CgProfile } from "react-icons/cg";
import { MdDashboard } from "react-icons/md";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { MdLeaderboard, MdAssignmentAdd } from "react-icons/md";
import { SiBookstack } from "react-icons/si";
import { PiExamFill } from "react-icons/pi";
import { BiSolidReport, BiSolidLogOut } from "react-icons/bi";
import { FaNewspaper, FaBook, FaRobot } from "react-icons/fa";
import { AiFillSetting } from "react-icons/ai";
import AssistantIcon from "@mui/icons-material/Assistant";
import HomeIcon from "@mui/icons-material/Home";
import ClassIcon from "@mui/icons-material/Class";
import { LoaderIcon } from "react-hot-toast";
import { VideoCall } from "@mui/icons-material";
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import ChatIcon from '@mui/icons-material/Chat';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import { useTranslation } from "react-i18next";

const Leftbar = () => {
  const { t } = useTranslation();
  const data = GetUserQuery();
  const [user, setuser] = useState();
  const [loading, setloading] = useState(true);
  useEffect(() => {
    setuser(data.data);
    if (data.data) {
      setloading(false);
    }
  }, [data.data]);

  const [selected, setSelected] = useState("");

  useEffect(() => {
    const path = window.location.pathname;
    setSelected(path);
  }, []);

  return (
    <>
      {!loading ? (
        <div className="hidden lg:block h-full bg-white border-r fixed w-[300px] overflow-y-auto">
          <div className="flex items-center justify-center h-14 border-b">
            <div>
              {user ? (
                <h1 className="font-bold">
                  {t("sidebar_hello")}, {user?.name.toUpperCase()}{" "}
                </h1>
              ) : (
                <Link to="/login">{t("nav_login")}</Link>
              )}
            </div>
          </div>
          <div className="overflow-y-auto overflow-x-hidden flex-grow">
            <ul className="flex flex-col py-4 space-y-1">
              <li className="px-5">
                <div className="flex flex-row items-center h-8">
                  <div className="text-sm font-light tracking-wide text-gray-500">
                    {t("sidebar_dashboard")}
                  </div>
                </div>
              </li>
              {user?.role === "student" && (
                <li>
                  <div
                    className={
                      selected === "/user/sathi"
                        ? "border-zinc-700  bg-gray-50 relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent"
                        : "relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-indigo-500 pr-6"
                    }
                  >
                    <span className="inline-flex justify-center items-center ml-4"></span>
                    <AssistantIcon className="text-xl" />
                    <span className="ml-2 text-sm tracking-wide truncate">
                      <Link
                        to="/user/sathi"
                        onClick={() => setSelected("/user/sathi")}
                      >
                        {t("sidebar_virtual_mentor")}
                      </Link>
                    </span>
                  </div>
                </li>
              )}
              {/* <li>
                <div
                  className={
                    selected === "/user/chatbot"
                      ? "border-zinc-700  bg-gray-50 relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent"
                      : "relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-indigo-500 pr-6"
                  }
                >
                  <span className="inline-flex justify-center items-center ml-4"></span>
                  <ChatIcon className="text-xl" />
                  <span className="ml-2 text-sm tracking-wide truncate">
                    <Link
                      to="/user/chatbot"
                      onClick={() => setSelected("/user/chatbot")}
                    >
                      {t("sidebar_ai_chatbot")}
                    </Link>
                  </span>
                </div>
              </li> */}
              <li>
                <div
                  className={
                    selected === "/user/meet"
                      ? "border-zinc-700  bg-gray-50 relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent"
                      : "relative flex flex-row items-center h-11 focus:outline-none hover-bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-indigo-500 pr-6"
                  }
                >
                  <span className="inline-flex justify-center items-center ml-4"></span>
                  <VideoCall className="text-xl" />
                  <span className="ml-2 text-sm tracking-wide truncate">
                    <Link
                      to="/user/meet"
                      onClick={() => setSelected("/user/meet")}
                    >
                      {t("sidebar_video_call")}
                    </Link>
                  </span>
                </div>
                  <div
                  className={
                    selected === "/user/personal-meeting"
                      ? "border-zinc-700  bg-gray-50 relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent"
                      : "relative flex flex-row items-center h-11 focus:outline-none hover-bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-indigo-500 pr-6"
                  }
                >
                  <span className="inline-flex justify-center items-center ml-4"></span>
                  <SiBookstack className="text-xl" />
                  <span className="ml-2 text-sm tracking-wide truncate">
                    <Link
                      to="/user/personal-meeting"
                      onClick={() => setSelected("/user/personal-meeting")}
                    >
                     {t("sidebar_personal_meetings")}
                    </Link>
                  </span>
                </div>
              </li>
               <li>
                  <div
                    className={
                      selected === "/user/chat"
                        ? "border-zinc-700  bg-gray-50 relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent"
                        : "relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-indigo-500 pr-6"
                    }
                  >
                    <span className="inline-flex justify-center items-center ml-4"></span>
                    <PiExamFill className="text-xl" />
                    <span className="ml-2 text-sm tracking-wide truncate">
                      <Link
                        to="/user/chat"
                        onClick={() => setSelected("/user/chat")}
                      >
                        {t("sidebar_chat")}
                      </Link>
                    </span>
                  </div>
                </li>
              {user?.role === "mentor" ? (
                <li>
                  <div
                    className={
                      selected === "/mentor/my-test"
                        ? "border-zinc-700  bg-gray-50 relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent"
                        : "relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-indigo-500 pr-6"
                    }
                  >
                    <span className="inline-flex justify-center items-center ml-4"></span>
                    <PiExamFill className="text-xl" />
                    <span className="ml-2 text-sm tracking-wide truncate">
                      <Link
                        to="/mentor/my-test"
                        onClick={() => setSelected("/mentor/my-test")}
                      >
                        {t("mentor_tests")}
                      </Link>
                    </span>
                  </div>
                </li>
              ) : (
                <li>
                  <div
                    className={
                      selected === "/user/test"
                        ? "border-zinc-700  bg-gray-50 relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent"
                        : "relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-indigo-500 pr-6"
                    }
                  >
                    <span className="inline-flex justify-center items-center ml-4"></span>
                    <PiExamFill className="text-xl" />
                    <span className="ml-2 text-sm tracking-wide truncate">
                      <Link
                        to="/user/test"
                        onClick={() => setSelected("/user/test")}
                      >
                        {t("sidebar_tests")}
                      </Link>
                    </span>
                  </div>
                </li>
              )}
              {user?.role === "mentor" ? (
                <li>
                  <div
                    className={
                      selected === "/mentor/createtest"
                        ? "border-zinc-700  bg-gray-50 relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent"
                        : "relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-indigo-500 pr-6"
                    }
                  >
                    <span className="inline-flex justify-center items-center ml-4"></span>
                    <PiExamFill className="text-xl" />
                    <span className="ml-2 text-sm tracking-wide truncate">
                      <Link
                        to="/mentor/createtest"
                        onClick={() => setSelected("/mentor/createtest")}
                      >
                        {t("create_test")}
                      </Link>
                    </span>
                  </div>
                </li>
              ) : (
                ""
              )}
              <li>
                <div
                  className={
                    selected === "/user/discuss"
                      ? "border-zinc-700  bg-gray-50 relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent"
                      : "relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-indigo-500 pr-6"
                  }
                >
                  <span className="inline-flex justify-center items-center ml-4"></span>
                  <RiDiscussFill className="text-xl" />
                  <span className="ml-2 text-sm tracking-wide truncate">
                    <Link
                      to="/user/discuss"
                      onClick={() => setSelected("/user/discuss")}
                    >
                      {t("discuss")}
                    </Link>
                  </span>
                </div>
              </li>
              {user?.role === "student" && (
                <li>
                  <div
                    className={
                      selected === "/user/book-meeting"
                        ? "border-zinc-700  bg-gray-50relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent"
                        : "relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-indigo-500 pr-6"
                    }
                  >
                    <span className="inline-flex justify-center items-center ml-4"></span>
                    <MeetingRoomIcon className="text-xl" />
                    <span className="ml-2 text-sm tracking-wide truncate">
                      <Link
                        to="/user/book-meeting"
                        onClick={() => setSelected("/user/book-meeting")}
                      >
                        {t("sidebar_personal_meetings")}
                      </Link>
                    </span>
                  </div>
                </li>
              )}
            {user?.role == "student" ? (
                <li>
              <div className="relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-indigo-500 pr-6">
                <span className="inline-flex justify-center items-center ml-4"></span>
                <BiSolidReport className="text-xl" />
                <span className="ml-2 text-sm tracking-wide truncate">
                  <Link to="/user/my-submissions">{t("sidebar_mysubmissions")}</Link>
                </span>
              </div>
            </li>
            ):""}
              <li>
                <div className="relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-indigo-500 pr-6">
                  <span className="inline-flex justify-center items-center ml-4"></span>
                  <HomeIcon className="text-xl" />
                  <span className="ml-2 text-sm tracking-wide truncate">
                    <Link to="/">{t("home")}</Link>
                  </span>
                </div>
              </li>
              {/* <li>
                <div className="relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-indigo-500 pr-6">
                  <span className="inline-flex justify-center items-center ml-4"></span>
                  <MdLeaderboard className="text-xl" />
                  <span className="ml-2 text-sm tracking-wide truncate">
                    <Link to="/user/leaderboard">{t("leaderboard")}</Link>
                  </span>
                </div>
              </li> */}
              {user?.role === "mentor" ? (
                <li>
                  {/* <div className="relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-indigo-500 pr-6">
                    <span className="inline-flex justify-center items-center ml-4"></span>
                    <ClassIcon className="text-xl" />
                    <span className="ml-2 text-sm tracking-wide truncate">
                      <Link to="/mentor/classroom">{t("your_classroom")}</Link>
                    </span>
                  </div> */}
                </li>
              ) : (
                ""
              )}
              <li>
                {/* <div className="relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-indigo-500 pr-6">
                  <span className="inline-flex justify-center items-center ml-4"></span>
                  <FaNewspaper className="text-xl" />
                  <span className="ml-2 text-sm tracking-wide truncate">
                    <Link to="/user/newsfeed">{t("news_feed")}</Link>
                  </span>
                </div> */}
              </li>
              {user?.role !== "mentor" ? (
                <li>
                  <div
                    className={
                      selected === "/user/material" ||
                      selected === "/mentor/material"
                        ? "border-zinc-700  bg-gray-50 relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent"
                        : "relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-indigo-500 pr-6"
                    }
                  >
                    <span className="inline-flex justify-center items-center ml-4"></span>
                    <MdAssignmentAdd className="text-xl" />
                    <span className="ml-2 text-sm tracking-wide truncate">
                      <Link
                        to={`${
                          user?.role === "student"
                            ? "/user/material"
                            : "/mentor/material"
                        }`}
                        onClick={() => setSelected("/user/material")}
                      >
                        {t("sidebar_materials")}
                      </Link>
                    </span>
                  </div>
                </li>
              ) : (
                ""
              )}{" "}
              {user?.role === "mentor" ? (
                <li>
                  <div
                    className={
                      selected === "/mentor/Meetings" ||
                      selected === "/mentor/Meetings"
                        ? "border-zinc-700  bg-gray-50 relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent"
                        : "relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-indigo-500 pr-6"
                    }
                  >
                    <span className="inline-flex justify-center items-center ml-4"></span>
                    <MdAssignmentAdd className="text-xl" />
                    <span className="ml-2 text-sm tracking-wide truncate">
                      <Link
                        to={`${
                          user?.role === "student"
                            ? "/mentor/Meetings"
                            : "/mentor/Meetings"
                        }`}
                        onClick={() => setSelected("/mentor/Meetings")}
                      >
                        {t("your_meetings")}
                      </Link>
                    </span>
                  </div>
                </li>
              ) : (
                ""
              )}{" "}
              <li className="px-5">
                <div className="flex flex-row items-center h-8">
                  <div className="text-sm font-light tracking-wide text-gray-500">
                    {t("settings")}
                  </div>
                </div>
              </li>
              <li>
                <div
                  className={
                    selected === "/user/profile"
                      ? "border-zinc-700  bg-gray-50 relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent"
                      : "relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-indigo-500 pr-6"
                  }
                >
                  <span className="inline-flex justify-center items-center ml-4">
                    <CgProfile className="text-xl" />
                  </span>
                  <span className="ml-2 text-sm tracking-wide truncate">
                    <Link
                      to="/user/profile"
                      onClick={() => setSelected("/user/profile")}
                    >
                      {t("profile")}
                    </Link>
                  </span>
                </div>
              </li>
              <li>
                <div
                  className={
                    selected === "/user/settings"
                      ? "border-zinc-700  bg-gray-50 relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent"
                      : "relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-indigo-500 pr-6"
                  }
                >
                  <span className="inline-flex justify-center items-center ml-4"></span>
                  <AiFillSetting className="text-xl" />
                  <span className="ml-2 text-sm tracking-wide truncate">
                    <Link
                      to="/user/settings"
                      onClick={() => setSelected("/user/settings")}
                    >
                      {t("settings")}
                    </Link>
                  </span>
                </div>
              </li>
              {user?.role === "mentor" && (
                <li>
                  <div
                    className={
                      selected === "/mentor/createMaterial"
                        ? "border-zinc-700  bg-gray-50 relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent"
                        : "relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-indigo-500 pr-6"
                    }
                  >
                    <span className="inline-flex justify-center items-center ml-4"></span>
                    <AiFillSetting className="text-xl" />
                    <span className="ml-2 text-sm tracking-wide truncate">
                      <Link
                        to="/mentor/createMaterial"
                        onClick={() => setSelected("/mentor/createMaterial")}
                      >
                        {t("sidebar_create_material")}
                      </Link>
                    </span>
                  </div>
                </li>
              )}
              <li>
                <div
                  className={
                    selected === "/login"
                      ? "border-zinc-700  bg-gray-50 relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent"
                      : "relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-indigo-500 pr-6"
                  }
                >
                  <span className="inline-flex justify-center items-center ml-4"></span>
                  <BiSolidLogOut className="text-xl" />
                  <span className="ml-2 text-sm tracking-wide truncate">
                    <Link
                      onClick={() => {
                        localStorage.removeItem("token");
                      }}
                      to="/login"
                    >
                      {t("sidebar_logout")}
                    </Link>
                  </span>
                </div>
              </li>
              {/* Digital Library Link for both roles */}
              <li>
                <div
                  className={
                    selected === "/mentor/digital-library" || selected === "/user/digital-library"
                      ? "border-zinc-700 bg-gray-50 relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent"
                      : "relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-indigo-500 pr-6"
                  }
                >
                  <span className="inline-flex justify-center items-center ml-4"></span>
                  <LibraryBooksIcon className="text-xl" />
                  <span className="ml-2 text-sm tracking-wide truncate">
                    <Link
                      to={user?.role === "mentor" ? "/mentor/digital-library" : "/user/digital-library"}
                      onClick={() => setSelected(user?.role === "mentor" ? "/mentor/digital-library" : "/user/digital-library")}
                    >
                      {t("sidebar_digital_library")}
                    </Link>
                  </span>
                </div>
              </li>
              
              {/* Video Library Link for both roles */}
              <li>
                <div
                  className={
                    selected === "/mentor/video-upload" || selected === "/user/video-library"
                      ? "border-zinc-700 bg-gray-50 relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent"
                      : "relative flex flex-row items-center h-11 focus:outline-none hover:bg-gray-50 text-gray-600 hover:text-gray-800 border-l-4 border-transparent hover:border-indigo-500 pr-6"
                  }
                >
                  <span className="inline-flex justify-center items-center ml-4"></span>
                  <VideoLibraryIcon className="text-xl" />
                  <span className="ml-2 text-sm tracking-wide truncate">
                    <Link
                      to={user?.role === "mentor" ? "/mentor/video-upload" : "/user/video-library"}
                      onClick={() => setSelected(user?.role === "mentor" ? "/mentor/video-upload" : "/user/video-library")}
                    >
                      {user?.role === "mentor" ? t("sidebar_video_library") : t("sidebar_video_library")}
                    </Link>
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center m-20">
          <LoaderIcon
            style={{
              width: "20px",
              height: "20px",
            }}
          />
        </div>
      )}
    </>
  );
};

export default Leftbar;
