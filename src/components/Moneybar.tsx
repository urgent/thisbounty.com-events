import React, { useState, useEffect } from "react";
import eventEmitter from "../eventEmitter"

export interface MoneybarProps { max: number; money: number; }

export const Moneybar = (props: MoneybarProps): React.ReactElement => {
    const [money, setMoney] = useState(props.money);
    const [max, setMaxMoney] = useState(props.max);

    useEffect(() => {
        eventEmitter.on('your-event', () => setMoney(3))

    })

    return <>
        <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            width="188"
            height="37"
            fill="none"
            version="1.1"
            viewBox="0 0 188 37"
        >
            <g clip-path="url(#clip0)">
                <g filter="url(#filter0_d)">
                    <path
                        fill="url(#linearGradient4670)"
                        d={`M14 14h${money / max * 168.5}c5.059-.106 4.081 8.083-.793 7H14v-7z`}
                    ></path>
                    <path
                        stroke="#fff"
                        strokeWidth="2"
                        d="M14 13h-1v9h169.5a4.5 4.5 0 000-9z"
                    ></path>
                </g>
                <path
                    fill="#fff"
                    stroke="#fff"
                    strokeLinejoin="round"
                    strokeWidth="3"
                    d="M9.5 12.347L5.25 5h7.969z"
                ></path>
                <path
                    fill="#fff"
                    d="M9.5 25c4.694 0 8.5-3.655 8.5-8.163 0-4.509-3.806-8.164-8.5-8.164S1 12.328 1 16.837C1 21.345 4.806 25 9.5 25z"
                ></path>
                <path
                    fill="#343a40"
                    d="M10.377 17.632a.81.81 0 00-.253-.605c-.167-.165-.45-.313-.848-.446-.555-.17-.96-.39-1.215-.66-.252-.273-.379-.62-.379-1.04 0-.426.124-.776.371-1.05.25-.273.593-.436 1.028-.488v-.856h.582v.86c.437.06.777.243 1.02.55.244.308.366.728.366 1.262h-.718c0-.367-.088-.659-.262-.875a.86.86 0 00-.707-.324c-.31 0-.547.08-.711.242-.164.16-.246.382-.246.668 0 .266.086.478.258.637.174.156.46.3.855.43.399.127.708.27.93.425.224.154.388.334.492.54.107.205.16.446.16.722 0 .44-.133.794-.398 1.063-.263.268-.633.427-1.11.476v.746h-.578v-.746c-.484-.044-.864-.216-1.14-.515-.274-.302-.41-.711-.41-1.227h.722c0 .362.095.64.285.836.19.195.46.293.809.293.341 0 .61-.082.805-.246.195-.164.292-.388.292-.672z"
                ></path>
            </g>
            <defs id="defs935">
                <filter
                    id="filter0_d"
                    width="184"
                    height="19"
                    x="8"
                    y="12"
                    colorInterpolationFilters="sRGB"
                    filterUnits="userSpaceOnUse"
                >
                    <feFlood
                        id="feFlood912"
                        floodOpacity="0"
                        result="BackgroundImageFix"
                    ></feFlood>
                    <feColorMatrix
                        id="feColorMatrix914"
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                    ></feColorMatrix>
                    <feOffset id="feOffset916" dy="4"></feOffset>
                    <feGaussianBlur
                        id="feGaussianBlur918"
                        stdDeviation="2"
                    ></feGaussianBlur>
                    <feColorMatrix
                        id="feColorMatrix920"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
                    ></feColorMatrix>
                    <feBlend
                        id="feBlend922"
                        in2="BackgroundImageFix"
                        mode="normal"
                        result="effect1_dropShadow"
                    ></feBlend>
                    <feBlend
                        id="feBlend924"
                        in="SourceGraphic"
                        in2="effect1_dropShadow"
                        mode="normal"
                        result="shape"
                    ></feBlend>
                </filter>
                <linearGradient
                    id="paint0_linear"
                    x1="14"
                    x2="186"
                    y1="21"
                    y2="21"
                    gradientUnits="userSpaceOnUse"
                >
                    <stop id="stop927" stopColor="#3E8832"></stop>
                    <stop id="stop929" offset="1" stopColor="#2BC012"></stop>
                </linearGradient>
                <clipPath id="clip0">
                    <path id="path932" fill="#fff" d="M0 0h188v37H0V0z"></path>
                </clipPath>
                <linearGradient
                    id="linearGradient4670"
                    x1="14"
                    x2="186"
                    y1="21"
                    y2="21"
                    gradientUnits="userSpaceOnUse"
                    xlinkHref="#paint0_linear"
                ></linearGradient>
            </defs>
        </svg>
    </>
};