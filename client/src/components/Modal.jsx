import React from "react";

export const Modal = (props) => {
  return (
    <>
    <section className={props.className}>
      <div
        tabIndex="-1"
        role="dialog"
        className="fixed top-0 left-0 right-0 z-50 w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full"
      >
        <div className="relative w-full max-w-2xl max-h-full">
          <div className="relative bg-white bg-opacity-100 rounded-lg">
            <div className="flex items-start justify-between p-4 border-b rounded-t dark:border-gray-600">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {props.title}
              </h3>
              <button
                type="button"
                className="text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
              >
                <svg
                  className="w-3 h-3"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 14"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                  />
                </svg>
                <span onClick={props.closeFunction} className="sr-only">Close modal</span>
              </button>
            </div>
            <div className="p-6 space-y-6">
              <img src={props.gif} alt="Exercise GIF" />
              
              <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                Body Part: {props.targetMuscle}
              </p>
              <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                Equipment: {props.equip}
              </p>
            </div>
          </div>
        </div>
      </div>
      </section>
    </>
  );
};
