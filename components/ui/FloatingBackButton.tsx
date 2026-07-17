"use client"

import React from 'react'
import { IoMdArrowRoundBack } from "react-icons/io";

export default function FlottingBackButton() {
    return (
        <div onClick={() => window.history.back()} className='absolute top-5 left-10 w-10 h-10 rounded-full bg-gray1 hover:bg-gray2 flex items-center justify-center cursor-pointer'><IoMdArrowRoundBack /></div>
    )
}
