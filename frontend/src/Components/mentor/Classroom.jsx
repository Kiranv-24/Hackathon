import React from 'react';
import { Link } from 'react-router-dom';
import Pencil from '../../assets/pencil.png';
import Searchbox from '../SearchBox';
import { useTranslation } from 'react-i18next';

const navigationLink = [
  {
    name: 'dashboard_check_meetings',
    path: '/mentor/meetings',
    icons: Pencil,
  },
  {
    name: 'dashboard_view_test',
    path: '/mentor/my-test',
    icons: Pencil,
  },
  {
    name: 'dashboard_discuss_portal',
    path: 'user/discuss',
    icons: Pencil,
  },
  {
    name: 'dashboard_created_course',
    path: '/mentor/material',
    icons: Pencil,
  },
  {
    name: 'dashboard_materials',
    path: '/mentor/material',
    icons: Pencil,
  },
  {
    name: 'dashboard_digital_library',
    path: '/mentor/digital-library',
    icons: Pencil,
  },
  {
    name: 'dashboard_reach_news',
    path: '/mentor/meetings',
    icons: Pencil,
  },
];

const Classroom = () => {
  const { t } = useTranslation();

  return (
    <div className='base-container gap-20 py-[5vh]'>
      <div className='flex-row-center mb-10'>
        {navigationLink.map((obj, id) => (
          <Link
            key={id}
            to={obj.path}
            className='bg-green-200 h-[70px] px-2 gap-2 rounded-md w-[200px] font-comf text-sm flex flex-row justify-between items-center m-2'
          >
            <button>
              <img src={obj.icons} className='w-[50px]' />
            </button>
            {t(obj.name)}
          </Link>
        ))}
      </div>
      <hr className='my-5' />
      <div className=''>
        <Searchbox />
        
      </div>
    </div>
  );
};

export default Classroom;
