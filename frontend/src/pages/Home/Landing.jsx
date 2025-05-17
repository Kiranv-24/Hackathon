import React, { useState, useEffect } from "react";import { Link } from "react-router-dom";import { Typewriter } from "react-simple-typewriter";import { useNavigate } from "react-router";import axios from "axios";import { useTranslation } from "react-i18next";import i18n from "../../Language/i18n";import LanguageSelector from "../../Components/LanguageSelector";
import CancelIcon from "@mui/icons-material/Cancel";
import primaryImage from "../../assets/primary-background.png";
// import Demo from "../../assets/demo.jpg";
import Chatbot from "../../assets/chatbot.png";


import * as Links from "./Links";
import Container from "./Container";
import { GetUserQuery } from "../../api/user";
import OutboundIcon from "@mui/icons-material/Outbound";
import { BiRightArrow } from "react-icons/bi";

import { GoGlobe } from "react-icons/go";
import { GiHamburgerMenu } from "react-icons/gi";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { AiOutlineArrowRight } from "react-icons/ai";

import MapCommunities from "./Mapbox/MapCommunities";
import Searchbox from "../../Components/SearchBox";
import { ImCross } from "react-icons/im";
import { LoaderIcon } from "react-hot-toast";

const Landing = () => {
  const [dropDown, setDropDown] = useState(false);
  const [sitestatus, setsitestatus] = useState(true);
  const data = GetUserQuery();
  const [user, setuser] = useState();
  const [scrollLeft, setScrollLeft] = useState(0);
  const [chatbot, setChatbot] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setloading] = useState(false);
  const [chatquestion, setChatquestion] = useState([
    { bot: "Hi this is Sathi Bot how may i help u?" },
    { user: "Hi i want some answer" },
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setloading(true);
    console.log(question);
    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/predict",
        `question=${encodeURIComponent(question)}`,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
      if (response) {
        setloading(false);
        setAnswer(response.data.answer);
      }

      console.log(response);
    } catch (error) {
      console.error(error);
    }
  };
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const array = [1, 2, 3, 4, 5, 6];
  const arr = [1, 2, 3];

  const scrollLeftHandler = () => {
    const scrollContainer = document.getElementById("scroll-container");
    const scrollStep = 100;
    scrollContainer.scrollLeft -= scrollStep;

    setScrollLeft(scrollContainer.scrollLeft);
  };
  const scrollRightHandler = () => {
    const scrollContainer = document.getElementById("scroll-container");
    const scrollStep = 100;
    scrollContainer.scrollLeft += scrollStep;
    setScrollLeft(scrollContainer.scrollLeft);
  };
  const code = "ERR_NETWORK";
  const checkstatus = async () => {
    await axios
      .get(`${import.meta.env.VITE_BASE_URL}/v1/user/get-allquestions`)
      .then((res) => {
        console.log(res.data, "status site");
        setsitestatus(true);
      })
      .catch((err) => {
        console.log(err.code);
        setsitestatus(false);
      });
  };
  useEffect(() => {
    setuser(data?.data);
    checkstatus();
  }, [data.data]);

  const handleQuestionChange = (e) => {
    setQuestion(e.target.value);
  };

  const navigate = useNavigate();

  const NavLinks = ({ obj }) => {
    return !obj.protected ? (
      <Link
        to={obj.path}
        className="hover:text-theme cursor-pointer tracking-widest  "
      >
        {t(obj.name)}
      </Link>
    ) : user ? (
      <Link
        to={obj.path}
        className="hover:text-theme cursor-pointer tracking-widest  "
      >
        {t(obj.name)}
      </Link>
    ) : (
      ""
    );
  };
  const handleChange = (e) => {
    e.preventDefault();
    const value = document.getElementById("language").value;
    console.log(value);
  };
  return (
    <div className=" bg-background text-center">
      <section>
        <div
          className="cursor-pointer w-[120px] h-[120px] rounded-full  fixed bottom-1"
          onClick={() => {
            setChatbot(true);
          }}
        >
          <button>
            <img className="w-full" src={Chatbot} />
          </button>
        </div>
        <div
          className={`${
            chatbot ? "" : "hidden"
          } w-[300px] h-[300px] bg-green-100 rounded-lg fixed bottom-24 p-3 left-24`}
        >
          <div className="">
            <ImCross
              className=""
              onClick={() => {
                setChatbot(false);
              }}
            />
          </div>
          <div className="px-5 w-full h-3/4 my-2 border-2 border-gray-500 p-2 overflow-y-auto gap-2">
            {answer && (
              <div className="chat-message">
                <strong>Saathi:</strong> {answer}
              </div>
            )}
          </div>
          <form
            onSubmit={handleSubmit}
            className="space-x-2  font-comf flex-row-between border-2 border-gray-500 px-2 py-1 rounded-md"
          >
            <input
              type="text"
              placeholder="Search for the meeting..."
              className="w-full outline-none  bg-green-100"
              value={question}
              onChange={handleQuestionChange}
            />

            <button type="submit" className="">
              {loading ? (
                <h1>
                  <LoaderIcon />
                </h1>
              ) : (
                <BiRightArrow />
              )}
            </button>
          </form>
        </div>
      </section>

      <section className="fixed inset-x-0 mx-auto w-full custom-navbar-width z-10 py-5 ">
        <nav className="bg-white text-primary  lg:flex hidden flex-row justify-between px-5 py-1  rounded-2xl shadow-md items-center text-para  z-10 border-nav">
          <div className="mx-2 w-[200px]">
            <Link to="" className="text-5xl font-right ">
              Code<span className="text-theme">Blenders</span>
            </Link>
          </div>

          <div className=" mx-2  list-none space-x-10  flex-row-center text-lg text-primary font-comf">
            {Links.Navbar_Links.map((obj, id) => (
              <NavLinks obj={obj} />
            ))}

            {/* <li className="flex flex-row items-center hover:text-theme cursor-pointer ">
              &nbsp;
              <span>
                {data?.data?.role === "mentor" ? (
                  <Link to="/mentor/Meetings">Meetings</Link>
                ) : (
                  <Link to="/user/book-meeting">Book a call</Link>
                )}
              </span>
              d
            </li> */}

            {user && user?.role == "student" ? (
              <Link to="/user/leaderboard">
                <button className="  ">DASHBOARD</button>
              </Link>
            ) : (
              user && (
                <Link to="/mentor/classroom">
                  <button className=" ">DASHBOARD</button>
                </Link>
              )
            )}
            {user ? (
              <li className="flex flex-row items-center hover:text-theme cursor-pointer ">
                &nbsp;<span>Hello, {data?.data?.name}</span>
              </li>
            ) : (
              ""
            )}
            <LanguageSelector />
            {user ? (
              <button
                className=" primary-btn "
                onClick={() => {
                  localStorage.removeItem("token");
                  navigate("/login");
                }}
              >
                LOG OUT
              </button>
            ) : (
              <Link to="/login">
                <button className=" primary-btn ">Login</button>
              </Link>
            )}
          </div>
        </nav>

        <nav className="text-primary flex lg:hidden flex-row justify-between px-5 py-2 my-4 rounded-lg shadow-md items-center text-para   z-10  border-nav bg-white space-x-5">
          <div className="mx-2 w-[100px]">
            <Link to="/" className="text-4xl font-right ">
              Code<span className="text-theme">Blendes</span>
            </Link>
          </div>
          <div className="mx-2  flex-row-between">
            <p
              className="text-4xl font-heading "
              onClick={() => setDropDown(!dropDown)}
            >
              <GiHamburgerMenu />
            </p>
          </div>
        </nav>
      </section>

      {dropDown && (
        <section className="absolute inset-x-0 mx-auto custom-navbar-width top-32 z-10 font-comf">
          <div className=" flex flex-col list-none top-32 rounded-lg leading-10 text-left px-7  py-3 custom-navbar-width border-2 border-[#cbcdd4] bg-white z-10">
            {Links.Navbar_Links.map((obj, id) => (
              <NavLinks obj={obj} />
            ))}
            <li className="flex flex-row items-center hover:text-theme cursor-pointer ">
              <span>English</span>&nbsp;
              <GoGlobe />
            </li>

            <Link
              to="/user/leaderboard"
              className=" my-5 px-10 text-medium font-theme py-1 w-full bg-theme rounded-full z-10"
            >
              GET STARTED
            </Link>
          </div>
        </section>
      )}

      <section style={{ backgroundImage: `url(${primaryImage})` }}>
        <div className="primary-container md:w-2/3 mx-auto gap-5 md:leading-10 leading-7 text-center  flex flex-col items-center justify-center h-[100vh] translate-y-14 relative ">
          {!sitestatus ? (
            <div className="bg-red-500 p-3 w-45 flex flex-row items-center justify-center rounded-xl">
              <CancelIcon
                style={{
                  color: "white",
                  margin: "2px",
                }}
              />
              <h1 className="text-lg font-semibold text-white">
                {t('site_status_down')}
              </h1>
            </div>
          ) : (
            <div className="bg-green-500  p-3 w-45 flex flex-row items-center justify-center rounded-xl">
              <OutboundIcon
                style={{
                  color: "white",
                  marginLeft: "2px",
                }}
              />
              <h1 className="text-lg font-semibold text-white">
                {t('site_status_up')}
              </h1>
            </div>
          )}
          <div className="md:text-7xl text-3xl md:my-5 my-3 font-merri">
            <span>
              <Typewriter
                words={[
                  "Learn Concepts",
                  "Find Resources",
                  "Appear For Tests",
                  "Daily Monitoring",
                  "Track Progress",
                  "1:1 Mentorship",
                  "Resolve Doubts",
                ]}
                loop
                cursor
                cursorStyle="|"
                typeSpeed={150}
                deleteSpeed={100}
                delaySpeed={1000}
              />
            </span>
          </div>

          <p className="md:text-lg text-sm font-comf"></p>
          {user && (
            <Link to="/user" className=" primary-btn ">
              DASHBOARD
            </Link>
          )}
        </div>
      </section>

     
    </div>
  );
};

export default Landing;
