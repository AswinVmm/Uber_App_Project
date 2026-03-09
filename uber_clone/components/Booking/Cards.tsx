import React from 'react'
import Image from 'next/image'
import cardsList from './CardsList'

function Cards() {
    const [activeIndex, setActiveIndex] = React.useState<any>();
    return (
        <div>
            <h2 className='text-lg font-medium'>Payment Methods</h2>
            <div className='grid grid-cols-5 mt-2'>
                {cardsList.map((item, index) => (
                    <div className={`w-25 h-15 gap-4 border flex items-center justify-center rounded-md
                     hover:border-green-500 cursor-pointer hover:scale-105 transition-all ${activeIndex === index ? ' border-green-500 border-2' : ''}`} onClick={() => setActiveIndex(index)} key={item.id}>
                        <Image src={item.image} alt={item.name} width={50} height={30} />
                    </div>
                ))}
            </div>
        </div>)
}

export default Cards