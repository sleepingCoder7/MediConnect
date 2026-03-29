import React, { useState } from 'react'

const ServiceCard = ({title, description}) => {

    const [flipped, setFlipped] = useState(false);

    const handleFlip = () => {
        setFlipped(!flipped);
    }

  return (
    <div className={`flip-card w-full h-40 cursor-pointer ${flipped ? 'flipped' : ''}`} onClick={handleFlip}> 
        <div className={`flip-card-inner h-full w-full`}>
            <div className={`flip-card-front bg-gray-200 flex items-center justify-center text-lg font-semibold shadow-md transform transition duration-300 ease-in-out hover:-translate-y-2 hover:shadow-2xl hover:scale-105 hover:bg-linear-to-r from-blue-500 to-blue-200 `}>
                {title}
            </div>
            <div className={`flip-card-back bg-blue-600 text-white flex items-center justify-center text-center p-4 font-semibold shadow-md transform transition duration-300 ease-in-out hover:-translate-y-2 hover:shadow-2xl hover:scale-105 hover:bg-linear-to-r from-blue-500 to-blue-400 `}>
                {description}
            </div>
        </div>
    </div>
  )
}

export default ServiceCard