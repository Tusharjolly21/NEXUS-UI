"use client";

import { forwardRef, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent, type MouseEvent as RMouseEvent, type PointerEvent as RPointerEvent, type ReactNode } from "react";
import { AnimatePresence, animate, cancelFrame, frame, motion, useInView, useMotionValue, useReducedMotion, useSpring, useTransform, useVelocity } from "framer-motion";

// Icons: Framework7 Icons (MIT) via Iconify, SF Symbols style. Inlined so the file has no icon dependency.
const ICON = {
  folder_fill: "<path fill=\"currentColor\" d=\"M47.57 10.563H24.766c-1.594 0-2.555-.399-3.727-1.383l-1.43-1.196c-1.547-1.289-2.742-1.734-5.062-1.734H7.562c-4.101 0-6.468 2.344-6.468 7.078v6.258h53.812v-1.781c0-4.828-2.46-7.242-7.336-7.242M8.453 49.75h39.82c4.195 0 6.633-2.437 6.633-7.266v-19.71H1.094v19.71c0 4.852 2.484 7.266 7.359 7.266\"/>",
  chevron_right: "<path fill=\"currentColor\" d=\"M18.695 48.367c.586 0 1.102-.234 1.524-.633L38.78 29.57c.446-.445.68-.984.68-1.57c0-.61-.234-1.172-.68-1.57L20.22 8.289a2.07 2.07 0 0 0-1.524-.656a2.12 2.12 0 0 0-2.156 2.156c0 .563.258 1.125.633 1.524L34.21 28L17.17 44.688c-.374.398-.632.937-.632 1.523c0 1.219.938 2.156 2.156 2.156\"/>",
  chevron_left_slash_chevron_right: "<path fill=\"currentColor\" d=\"M21.766 52.13c.955.267 1.89-.268 2.196-1.3L35.36 11.768c.287-1.031-.19-1.986-1.145-2.272c-.955-.268-1.89.267-2.196 1.298l-11.38 39.064c-.286 1.031.172 1.986 1.127 2.272m18.979-6.931l14.358-12.965c.897-.802.878-2.062 0-2.845L40.745 16.425c-.783-.744-1.871-.725-2.54.02c-.668.744-.553 1.813.21 2.52l13.098 11.837L38.415 42.66c-.764.706-.878 1.776-.21 2.52c.669.745 1.757.745 2.54.02m-25.509.019c.802.725 1.871.706 2.54-.039c.668-.744.572-1.794-.191-2.5L4.487 30.82l13.098-11.856c.763-.707.859-1.757.19-2.52c-.668-.745-1.737-.745-2.539-.02L.878 29.39c-.878.802-.778 2.062 0 2.845Z\"/>",
  paintbrush_fill: "<path fill=\"currentColor\" d=\"m19.316 22.738l15.657 15.657c1.758 1.757 3.586 1.476 5.226-.165l11.625-11.578c1.64-1.64 1.899-3.468.14-5.226l-2.367-2.344c-2.788 2.484-10.617 8.063-11.835 6.844c-.399-.399-.07-.75.164-.985c2.578-2.648 6.023-6.867 6.469-11.109L32.043 1.48C30.59.4 28.433.8 27.262 1.738c-2.367 3.352-2.32 8.953-7.946 15.657c-1.546 1.875-1.804 3.539 0 5.343M5.488 52.832c3.094 3.047 6.985 3.14 9.75.375c2.18-2.156 4.453-7.945 6.024-10.64l6.562 6.538c1.875 1.876 3.961 1.922 5.719.165l1.477-1.5c1.757-1.758 1.71-3.844-.141-5.72L16.293 23.466c-1.875-1.899-3.937-1.945-5.719-.14L9.098 24.8c-1.805 1.781-1.758 3.82.14 5.719l6.516 6.539c-2.672 1.57-8.484 3.867-10.64 6.023c-2.837 2.813-2.696 6.727.374 9.75m3.188-3.305c-.774-.797-.797-2.062 0-2.859c.82-.797 2.086-.797 2.883 0c.797.82.797 2.039 0 2.86s-2.063.843-2.883 0\"/>",
  book_fill: "<path fill=\"currentColor\" d=\"M17.09 44.898c3.89 0 6.492 1.454 7.64 2.274c.422.234 1.618.937 1.875.96V12.696c-1.523-2.836-6-5.132-10.64-5.132c-5.86 0-10.828 3.375-11.93 5.648v33.094c0 1.547.914 2.133 2.016 2.133c.89 0 1.476-.305 2.039-.774c1.383-1.242 4.64-2.766 9-2.766m21.844 0c4.359 0 7.594 1.524 9 2.766c.538.445 1.125.773 2.015.773c1.102 0 2.016-.585 2.016-2.132V13.21c-1.102-2.274-6.047-5.648-11.907-5.648c-4.64 0-9.117 2.296-10.64 5.132V48.18c.258-.024 1.453-.75 1.898-1.008c1.125-.82 3.727-2.274 7.618-2.274\"/>",
  photo_fill: "<path fill=\"currentColor\" d=\"M7.715 49.574h40.57c4.899 0 7.36-2.437 7.36-7.265V13.69c0-4.828-2.461-7.265-7.36-7.265H7.715C2.84 6.426.355 8.84.355 13.69v28.62c0 4.851 2.485 7.265 7.36 7.265m10.218-21c-3.187 0-5.789-2.601-5.789-5.789c0-3.164 2.602-5.789 5.79-5.789c3.164 0 5.765 2.625 5.765 5.79c0 3.187-2.601 5.788-5.766 5.788M7.762 45.801c-2.25 0-3.633-1.36-3.633-3.657v-1.43l7.195-6.28c1.031-.914 2.156-1.383 3.211-1.383c1.125 0 2.32.469 3.352 1.43l4.5 4.03l11.18-9.937c1.171-1.031 2.46-1.5 3.773-1.5c1.289 0 2.625.492 3.75 1.524l10.78 9.984v3.61c0 2.25-1.405 3.609-3.632 3.609Z\"/>",
  gear_alt_fill: "<path fill=\"currentColor\" fill-rule=\"evenodd\" d=\"M22.792 51.433a23.9 23.9 0 0 1-6.878-2.694l.124-2.425c.169-3.307-2.384-5.85-5.682-5.682l-2.68.137a23.9 23.9 0 0 1-2.854-6.517l2.104-1.9c2.458-2.218 2.452-5.822 0-8.035l-2.243-2.025A23.9 23.9 0 0 1 7.28 15.88l3.076.157c3.307.169 5.85-2.384 5.682-5.682L15.88 7.28a23.9 23.9 0 0 1 6.41-2.597l2.026 2.243c2.22 2.458 5.823 2.452 8.036 0l1.9-2.104a23.9 23.9 0 0 1 6.516 2.853l-.137 2.68c-.169 3.308 2.384 5.851 5.682 5.683l2.425-.124a23.9 23.9 0 0 1 2.694 6.878l-1.69 1.525c-2.457 2.22-2.45 5.823 0 8.036l1.561 1.408a23.9 23.9 0 0 1-2.958 6.975l-2.032-.104c-3.307-.169-5.85 2.384-5.682 5.682l.104 2.032a23.9 23.9 0 0 1-6.975 2.958l-1.408-1.56c-2.22-2.458-5.823-2.452-8.036 0zM28 38c5.523 0 10-4.477 10-10s-4.477-10-10-10s-10 4.477-10 10s4.477 10 10 10\"/>",
  lock_fill: "<path fill=\"currentColor\" d=\"M28 4.258c-6.54 0-12.516 4.664-12.516 14.25v5.625c-2.53.305-3.773 1.828-3.773 4.828v17.883c0 3.375 1.547 4.898 4.664 4.898h23.25c3.117 0 4.664-1.523 4.664-4.898V28.938c0-3-1.242-4.594-3.773-4.875v-5.555c0-9.586-5.977-14.25-12.516-14.25m-8.742 13.734c0-6.539 3.89-10.125 8.742-10.125s8.742 3.586 8.742 10.125v6.047l-17.484.023Z\"/>",
  doc_text_fill: "<path fill=\"currentColor\" d=\"M15.555 53.125h24.89c4.852 0 7.266-2.461 7.266-7.336V24.508H30.742c-3 0-4.406-1.43-4.406-4.43V2.875H15.555c-4.828 0-7.266 2.484-7.266 7.36v35.554c0 4.898 2.438 7.336 7.266 7.336m15.258-31.828h16.64c-.164-.961-.844-1.899-1.945-3.047L32.57 5.102c-1.078-1.125-2.062-1.805-3.047-1.97v16.9c0 .843.446 1.265 1.29 1.265m-11.836 13.36c-.961 0-1.641-.68-1.641-1.594c0-.915.68-1.594 1.64-1.594h18.07c.938 0 1.665.68 1.665 1.593c0 .915-.727 1.594-1.664 1.594Zm0 8.929c-.961 0-1.641-.68-1.641-1.594s.68-1.594 1.64-1.594h18.07c.938 0 1.665.68 1.665 1.594s-.727 1.594-1.664 1.594Z\"/>",
  cube_box_fill: "<path fill=\"currentColor\" d=\"m41.266 19.117l8.812-5.015c-.352-.352-.774-.633-1.289-.915l-16.523-9.42C30.813 2.946 29.406 2.5 28 2.5s-2.812.445-4.266 1.266L18.977 6.46ZM28 26.641l10.008-5.672l-22.195-12.68l-8.602 4.899c-.516.28-.937.562-1.29.914ZM29.594 53.5c.164-.047.304-.117.469-.21l18.351-10.454c2.18-1.242 3.375-2.508 3.375-5.906V18.672c0-.703-.07-1.266-.187-1.781L29.594 29.453Zm-3.188 0V29.453L4.4 16.891a7.8 7.8 0 0 0-.188 1.78V36.93c0 3.398 1.195 4.664 3.375 5.906l18.352 10.453c.164.094.304.164.468.211\"/>",
  rectangle_expand_vertical: "<path fill=\"currentColor\" d=\"M28 18.672c1.008 0 1.875-.82 1.875-1.805V9.11l-.164-3.914l2.016 2.086l3.046 3.07c.375.352.82.563 1.29.563c.984 0 1.71-.703 1.71-1.664c0-.54-.21-.96-.609-1.312L29.36.672C28.868.227 28.493.1 28 .1c-.469 0-.867.127-1.36.572l-7.78 7.265c-.422.352-.633.774-.633 1.313c0 .96.703 1.664 1.71 1.664c.47 0 .938-.21 1.29-.562l3.046-3.07l2.016-2.087l-.14 3.914v7.758c0 .985.843 1.805 1.851 1.805M8.266 43.727h7.664v-3.54H8.758c-2.11 0-3.398-1.406-3.398-3.328V19.141c0-1.922 1.289-3.305 3.398-3.305h7.172v-3.54H8.266c-3.89 0-6.633 2.65-6.633 6.259v18.914c0 3.586 2.742 6.258 6.633 6.258m39.468 0c3.914 0 6.633-2.672 6.633-6.258V18.555c0-3.61-2.719-6.258-6.633-6.258H40.07v3.539h7.172c2.11 0 3.399 1.383 3.399 3.305v17.718c0 1.922-1.29 3.328-3.399 3.328H40.07v3.54ZM28 55.96c.492 0 .867-.188 1.36-.633l7.804-7.266c.399-.351.61-.773.61-1.312c0-.961-.704-1.64-1.688-1.64c-.469 0-.937.187-1.312.538l-3.047 3.07l-2.016 2.087l.164-3.914v-7.735c0-1.008-.867-1.828-1.875-1.828s-1.852.82-1.852 1.828v7.735l.141 3.914l-2.016-2.086l-3.046-3.07a1.78 1.78 0 0 0-1.266-.54c-1.008 0-1.734.68-1.734 1.641c0 .539.21.96.633 1.313l7.78 7.265c.493.445.891.633 1.36.633\"/>",
  rectangle_compress_vertical: "<path fill=\"currentColor\" d=\"M27.91 17.98c.476 0 .837-.18 1.312-.61l7.532-7.011c.384-.34.588-.747.588-1.267c0-.927-.701-1.606-1.651-1.606c-.452 0-.882.204-1.244.543l-2.94 2.94l-1.945 2.036l.158-3.8V1.742C29.72.792 28.883 0 27.91 0c-.972 0-1.786.792-1.786 1.742v7.463l.136 3.8l-1.946-2.036l-2.94-2.94c-.339-.34-.791-.543-1.244-.543c-.972 0-1.65.679-1.65 1.606c0 .52.203.927.61 1.267l7.509 7.011c.475.43.86.61 1.312.61M8.868 35.193h38.087c3.777 0 6.4-2.556 6.4-6.038v-2.308c0-3.483-2.623-6.038-6.4-6.038H8.867c-3.754 0-6.4 2.555-6.4 6.038v2.308c0 3.482 2.646 6.038 6.4 6.038m.475-3.415c-2.036 0-3.28-1.357-3.28-3.189v-1.176c0-1.832 1.244-3.19 3.28-3.19h37.137c2.036 0 3.28 1.358 3.28 3.19v1.176c0 1.832-1.244 3.19-3.28 3.19ZM27.911 56c.972 0 1.809-.792 1.809-1.742v-7.463l-.158-3.8l1.945 2.036l2.94 2.94c.362.34.792.543 1.244.543c.95 0 1.651-.656 1.651-1.606c0-.52-.204-.905-.588-1.267l-7.532-7.011c-.475-.43-.836-.588-1.311-.588c-.453 0-.837.158-1.312.588l-7.51 7.011c-.406.362-.61.747-.61 1.267c0 .95.679 1.606 1.651 1.606c.453 0 .905-.204 1.244-.543l2.94-2.94l1.946-2.036l-.136 3.8v7.463c0 .95.814 1.742 1.787 1.742\"/>",
  globe: "<path fill=\"currentColor\" d=\"M28.023 51.273c12.727 0 23.25-10.546 23.25-23.273C51.274 15.297 40.727 4.727 28 4.727S4.727 15.297 4.727 28c0 12.727 10.57 23.273 23.296 23.273m-6.75-35.414c1.383-3.492 3.282-6 5.368-6.773v7.312a34 34 0 0 1-5.368-.539m8.063-6.773c2.086.773 4.008 3.281 5.367 6.773a34 34 0 0 1-5.367.54Zm4.945.656c2.508.867 4.782 2.203 6.68 3.961c-1.031.586-2.227 1.078-3.563 1.5c-.843-2.18-1.922-4.031-3.117-5.46m-19.265 3.961a19.5 19.5 0 0 1 6.703-3.96c-1.219 1.429-2.274 3.28-3.14 5.46c-1.313-.422-2.509-.914-3.563-1.5m24.609 12.938c-.117-3.258-.61-6.282-1.383-8.953c1.758-.54 3.305-1.22 4.617-2.016c2.485 3 4.102 6.797 4.383 10.969Zm-30.867 0a19.05 19.05 0 0 1 4.383-10.97c1.289.798 2.859 1.477 4.593 2.017c-.773 2.671-1.242 5.695-1.359 8.953Zm20.578 0v-7.547a37 37 0 0 0 6.234-.727a36.2 36.2 0 0 1 1.29 8.274Zm-10.195 0a33.8 33.8 0 0 1 1.289-8.274c1.922.399 4.03.656 6.21.727v7.547ZM8.758 29.336h7.617c.094 3.305.586 6.398 1.36 9.094c-1.712.539-3.258 1.195-4.547 1.992a19.3 19.3 0 0 1-4.43-11.086m10.36 0h7.523v7.687c-2.18.07-4.29.305-6.211.727c-.727-2.531-1.196-5.414-1.313-8.414m10.218 7.687v-7.687h7.523c-.093 3-.562 5.883-1.289 8.414c-1.945-.422-4.031-.656-6.234-.727m8.906 1.407c.797-2.696 1.266-5.79 1.383-9.094h7.617a18.9 18.9 0 0 1-4.43 11.086c-1.289-.774-2.835-1.453-4.57-1.992m-16.969 1.828a34 34 0 0 1 5.368-.54v7.313c-2.086-.773-3.985-3.281-5.368-6.773m8.063-.54c1.945.048 3.727.235 5.367.54c-1.36 3.492-3.281 6-5.367 6.773Zm-14.25 2.65a19 19 0 0 1 3.492-1.454c.844 2.11 1.852 3.89 3.024 5.32a19.1 19.1 0 0 1-6.516-3.867m22.312-1.454q1.97.597 3.516 1.477a19.2 19.2 0 0 1-6.539 3.867c1.172-1.43 2.203-3.235 3.023-5.344\"/>",
  square_pencil: "<path fill=\"currentColor\" d=\"m48.777 9.977l1.688-1.735c.82-.82.82-1.969.023-2.742l-.54-.562c-.725-.727-1.874-.633-2.647.117L45.59 6.742ZM21.801 34.352l4.57-1.993l20.696-20.671l-3.212-3.165l-20.671 20.672l-2.11 4.407c-.187.398.281.937.727.75m-9.727 17.437H39.59c4.218 0 6.656-2.437 6.656-7.266V18.437l-3.773 3.774v22.125c0 2.437-1.313 3.68-2.93 3.68H12.144c-2.343 0-3.656-1.243-3.656-3.68V17.734c0-2.437 1.313-3.703 3.656-3.703h20.274l3.773-3.773H12.074c-4.875 0-7.36 2.437-7.36 7.265v27c0 4.852 2.485 7.266 7.36 7.266\"/>",
  folder_badge_plus: "<path fill=\"currentColor\" d=\"M45.556 30.91C51.21 30.91 56 26.18 56 20.466s-4.728-10.443-10.444-10.443c-5.735 0-10.443 4.728-10.443 10.443c0 5.756 4.708 10.444 10.443 10.444M0 42.196c0 4.255 2.18 6.373 6.455 6.373h34.928c3.68 0 5.818-2.138 5.818-6.373v-8.573a11 11 0 0 1-1.645.123c-.575 0-1.11-.04-1.665-.102v8.408c0 2.117-1.15 3.207-3.186 3.207H6.517c-2.056 0-3.207-1.09-3.207-3.228v-16.96h29.788a11.4 11.4 0 0 1-.699-3.104H3.31v-5.18c0-2.036 1.09-3.064 3.043-3.064h4.605c1.357 0 2.18.329 3.228 1.233l1.254 1.028c1.336 1.11 2.426 1.522 4.461 1.522h12.746a12 12 0 0 1 1.234-3.31H20.764c-1.398 0-2.241-.35-3.27-1.213l-1.253-1.049c-1.357-1.13-2.405-1.52-4.44-1.52H5.673C2.076 10.413 0 12.468 0 16.621ZM45.556 27.25c-.72 0-1.336-.493-1.336-1.254V21.72h-3.947a1.273 1.273 0 0 1-1.254-1.254c0-.678.576-1.254 1.254-1.254h3.947v-4.255c0-.782.617-1.275 1.336-1.275s1.337.493 1.337 1.274v4.256h3.947c.678 0 1.254.576 1.254 1.254s-.576 1.254-1.254 1.254h-3.947v4.276c0 .76-.617 1.254-1.337 1.254\"/>",
  trash: "<path fill=\"currentColor\" d=\"m44.524 48.66l1.617-34.265h2.343c.961 0 1.735-.797 1.735-1.758s-.774-1.782-1.735-1.782H38.242V7.34c0-3.352-2.273-5.531-5.882-5.531h-8.766c-3.61 0-5.86 2.18-5.86 5.53v3.516H7.54c-.937 0-1.758.82-1.758 1.782c0 .96.82 1.758 1.758 1.758h2.344L11.5 48.684c.164 3.375 2.39 5.507 5.766 5.507h21.492c3.351 0 5.601-2.156 5.765-5.53M21.484 7.574c0-1.336.985-2.273 2.391-2.273h8.227c1.43 0 2.414.937 2.414 2.273v3.281H21.484Zm-3.867 43.102c-1.36 0-2.367-1.032-2.437-2.39l-1.64-33.891h28.85l-1.546 33.89c-.07 1.383-1.055 2.39-2.438 2.39Zm17.344-4.125c.773 0 1.36-.633 1.383-1.524l.703-24.75c.023-.89-.586-1.547-1.383-1.547c-.726 0-1.336.68-1.36 1.524l-.702 24.773c-.024.844.562 1.524 1.359 1.524m-13.898 0c.797 0 1.382-.68 1.359-1.524l-.703-24.773c-.024-.844-.656-1.524-1.383-1.524c-.797 0-1.383.657-1.36 1.547l.727 24.75c.024.891.586 1.524 1.36 1.524m8.367-1.524V20.254c0-.844-.633-1.524-1.407-1.524c-.773 0-1.43.68-1.43 1.524v24.773c0 .844.657 1.524 1.43 1.524c.75 0 1.407-.68 1.407-1.524\"/>",
  arrow_uturn_left: "<path fill=\"currentColor\" d=\"M50.148 34.914c0-8.953-6.046-15.14-16.757-15.14H17.664l-5.508.257l4.454-3.797l6.75-6.609c.374-.375.562-.82.562-1.43c0-1.218-.82-2.062-2.062-2.062c-.516 0-1.126.258-1.524.656L6.555 20.312c-.469.446-.703.985-.703 1.57c0 .563.234 1.102.703 1.548l13.781 13.523a2.2 2.2 0 0 0 1.524.656c1.242 0 2.062-.843 2.062-2.062c0-.61-.188-1.055-.562-1.43l-6.75-6.586l-4.454-3.797l5.508.235h16.078c7.992 0 12.235 4.406 12.235 10.71c0 6.329-4.243 11.016-12.235 11.016h-5.39c-1.29 0-2.133.938-2.133 2.086c0 1.149.844 2.086 2.133 2.086h5.414c10.5 0 16.382-5.976 16.382-14.953\"/>",
} as const;

type IconName = keyof typeof ICON;
function Icon({ name, size = 16 }: { name: IconName; size?: number }) {
  return <svg viewBox="0 0 56 56" width={size} height={size} aria-hidden="true" className="pointer-events-none" dangerouslySetInnerHTML={{ __html: ICON[name] }} />;
}

export type TreeNode = { id: string; name: string; children?: TreeNode[]; /** bytes, for files */ size?: number };

const DEMO: TreeNode[] = [
  {
    id: "app",
    name: "app",
    children: [
      {
        id: "app/marketing",
        name: "(marketing)",
        children: [
          { id: "app/marketing/layout", name: "layout.tsx", size: 1140 },
          { id: "app/marketing/page", name: "page.tsx", size: 4210 },
        ],
      },
      { id: "app/globals", name: "globals.css", size: 2130 },
      { id: "app/layout", name: "layout.tsx", size: 1820 },
      { id: "app/page", name: "page.tsx", size: 3390 },
    ],
  },
  {
    id: "components",
    name: "components",
    children: [
      {
        id: "components/ui",
        name: "ui",
        children: [
          { id: "components/ui/button", name: "button.tsx", size: 2610 },
          { id: "components/ui/dialog", name: "dialog.tsx", size: 5120 },
          { id: "components/ui/tooltip", name: "tooltip.tsx", size: 1930 },
        ],
      },
      { id: "components/hero", name: "hero.tsx", size: 3810 },
      { id: "components/pricing", name: "pricing.tsx", size: 6240 },
    ],
  },
  { id: "lib", name: "lib", children: [{ id: "lib/utils", name: "utils.ts", size: 640 }] },
  {
    id: "public",
    name: "public",
    children: [
      { id: "public/logo", name: "logo.svg", size: 2290 },
      { id: "public/og", name: "og.png", size: 84200 },
    ],
  },
  { id: "package", name: "package.json", size: 1210 },
  { id: "readme", name: "README.md", size: 3080 },
  { id: "tailwind", name: "tailwind.config.ts", size: 910 },
];

const ROW = 30;
const INDENT = 18;
const POUR = { type: "spring", stiffness: 430, damping: 33 } as const;
const GLIDE = { type: "spring", stiffness: 620, damping: 42 } as const;

function look(n: TreeNode): { icon: IconName; tint: string } {
  if (n.children) return { icon: "folder_fill", tint: "#3ea6ff" };
  const ext = n.name.split(".").pop()!.toLowerCase();
  if (n.name === "package.json") return { icon: "cube_box_fill", tint: "#b8763a" };
  if (n.name.includes(".config.")) return { icon: "gear_alt_fill", tint: "#8e8e93" };
  if (n.name.includes("lock")) return { icon: "lock_fill", tint: "#8e8e93" };
  if (["tsx", "jsx"].includes(ext)) return { icon: "chevron_left_slash_chevron_right", tint: "#0a84ff" };
  if (["ts", "js", "mjs", "cjs"].includes(ext)) return { icon: "chevron_left_slash_chevron_right", tint: "#5e5ce6" };
  if (["css", "scss"].includes(ext)) return { icon: "paintbrush_fill", tint: "#ff9f0a" };
  if (["md", "mdx", "txt"].includes(ext)) return { icon: "book_fill", tint: "#8e8e93" };
  if (["png", "jpg", "jpeg", "svg", "webp", "gif", "avif"].includes(ext)) return { icon: "photo_fill", tint: "#30b350" };
  if (["html", "xml"].includes(ext)) return { icon: "globe", tint: "#8e8e93" };
  return { icon: "doc_text_fill", tint: "#8e8e93" };
}

const bytes = (b = 0) => (b < 1000 ? `${b} B` : b < 1e6 ? `${(b / 1000).toFixed(b < 1e4 ? 1 : 0)} KB` : `${(b / 1e6).toFixed(1)} MB`);
const sorted = (a: TreeNode[]) => [...a].sort((x, y) => (x.children ? 0 : 1) - (y.children ? 0 : 1) || x.name.localeCompare(y.name, undefined, { numeric: true, sensitivity: "base" }));

/* --------------------------------------------------------- tree helpers */
function findNode(nodes: TreeNode[], id: string, parent: string | null = null): { node: TreeNode; parent: string | null } | null {
  for (const n of nodes) {
    if (n.id === id) return { node: n, parent };
    if (n.children) {
      const hit = findNode(n.children, id, n.id);
      if (hit) return hit;
    }
  }
  return null;
}
const without = (nodes: TreeNode[], id: string): TreeNode[] => nodes.filter((n) => n.id !== id).map((n) => (n.children ? { ...n, children: without(n.children, id) } : n));
const withChild = (nodes: TreeNode[], target: string | null, child: TreeNode): TreeNode[] =>
  target === null ? [...nodes, child] : nodes.map((n) => (n.id === target ? { ...n, children: [...(n.children ?? []), child] } : n.children ? { ...n, children: withChild(n.children, target, child) } : n));
const renamed = (nodes: TreeNode[], id: string, name: string): TreeNode[] => nodes.map((n) => (n.id === id ? { ...n, name } : n.children ? { ...n, children: renamed(n.children, id, name) } : n));
/** "untitled folder", then "untitled folder 2", like Finder */
function freeName(want: string, siblings: TreeNode[], self?: string) {
  const taken = new Set(siblings.filter((n) => n.id !== self).map((n) => n.name.toLowerCase()));
  if (!taken.has(want.toLowerCase())) return want;
  const dot = want.lastIndexOf(".");
  const base = dot > 0 ? want.slice(0, dot) : want;
  const ext = dot > 0 ? want.slice(dot) : "";
  for (let i = 2; ; i++) if (!taken.has(`${base} ${i}${ext}`.toLowerCase())) return `${base} ${i}${ext}`;
}
const within = (n: TreeNode, id: string): boolean => n.id === id || !!n.children?.some((c) => within(c, id));
const total = (nodes: TreeNode[]): number => nodes.reduce((s, n) => s + 1 + (n.children ? total(n.children) : 0), 0);
const folderIds = (n: TreeNode): string[] => (n.children ? [n.id, ...n.children.flatMap(folderIds)] : []);

type Row = { node: TreeNode; depth: number; parent: string | null; pos: number; set: number };
function flatten(nodes: TreeNode[], open: Set<string>, depth = 0, parent: string | null = null, out: Row[] = []) {
  const kids = sorted(nodes);
  kids.forEach((n, i) => {
    out.push({ node: n, depth, parent, pos: i + 1, set: kids.length });
    if (n.children && open.has(n.id)) flatten(n.children, open, depth + 1, n.id, out);
  });
  return out;
}

/**
 * One row. A new row starts tucked under its folder and slides out, clipped at
 * the folder's lower edge so it seems to come from inside it; a closing row
 * slides back under the same edge.
 */
type ExitCtx = { fall: Set<string>; base: number };
const spinOf = (id: string) => {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) | 0;
  return (h & 1 ? 1 : -1) * (5 + (Math.abs(h) % 6));
};

/** The ids that were on screen after the last commit, so a row that is new this render can pour in. */
class SeenRows {
  private ids: Set<string>;
  constructor(ids: string[]) {
    this.ids = new Set(ids);
  }
  has(id: string) {
    return this.ids.has(id);
  }
  commit(ids: string[]) {
    this.ids = new Set(ids);
  }
}

const TreeRow = forwardRef<
  HTMLDivElement,
  {
    id: string;
    index: number;
    exitCtx: ExitCtx;
    k: number;
    fresh: boolean;
    reduced: boolean;
    opacity: number;
    delay: number;
    depth: number;
    rowProps: Record<string, unknown>;
    children: ReactNode;
  }
>(function TreeRow({ id, index, exitCtx, k, fresh, reduced, opacity, delay, depth, rowProps, children }, ref) {
  const y = useMotionValue(fresh && !reduced ? -k * ROW : 0);
  const falling = useRef(false);
  // everything above the folder's bottom edge is hidden (except a deleted row, which is flung away)
  const clip = useTransform(y, (v) => (k > 0 && !falling.current ? `inset(${Math.max(0, -(k - 1) * ROW - v)}px 0px 0px 0px)` : "inset(0px 0px 0px 0px)"));
  const spin = spinOf(id);
  return (
    <motion.div
      ref={ref}
      layout="position"
      {...rowProps}
      initial={reduced ? false : { opacity: 0 }}
      animate={{ y: 0, opacity }}
      custom={exitCtx}
      variants={{
        gone: (c: ExitCtx) => {
          if (reduced) return { opacity: 0 };
          if (c.fall.has(id)) {
            // deleted: it winds back a touch, then is flung off to the side, turning as it goes
            falling.current = true;
            const delay = Math.max(0, index - c.base) * 0.025;
            return {
              x: [0, -10, 420],
              rotate: [0, -0.6, spin * 0.7],
              opacity: [1, 0.95, 0],
              transition: { duration: 0.36, times: [0, 0.16, 1], ease: ["easeOut", [0.4, 0, 0.9, 0.6]], delay },
            };
          }
          // closed: drawn back in under its folder
          return { y: -k * ROW, opacity: 0, transition: { type: "spring", stiffness: 520, damping: 44, opacity: { duration: 0.22, delay: 0.06 } } };
        },
      }}
      exit="gone"
      transition={{ ...POUR, delay, opacity: { duration: opacity === 0 ? 0 : 0.2, delay }, layout: { ...POUR, delay: exitCtx.fall.size ? Math.min(0.36, 0.2 + exitCtx.fall.size * 0.025) : 0 } }}
      className="group relative flex cursor-default select-none items-center outline-none"
      style={{ y, clipPath: clip, WebkitClipPath: clip, height: ROW, paddingLeft: 4 + depth * INDENT, WebkitTouchCallout: "none" }}
    >
      {children}
    </motion.div>
  );
});

/**
 * Folder Tree: a project tree that behaves like Finder. Open a folder and its
 * files pour out from underneath it on springs, one after another; close it
 * and they are drawn back in. Option-click opens everything inside in a wave,
 * level by level. Drag a file and it lifts off and leans with your speed; hold
 * it over a closed folder and the folder springs open, as on a Mac; drop it and
 * it flies into place, sorted, while the folder bounces. New files and folders
 * slide out of the folder they are made in, already named "untitled" and ready
 * to rename; delete one and it is flung off the list, with an Undo. Arrow keys,
 * Option with the arrows, Return to rename, Delete, Cmd-Z and type-to-find all
 * work like the Finder sidebar.
 */
export function FolderTree({
  tree = DEMO,
  name = "my-app",
  defaultOpen = ["app"],
  draggable = true,
  editable = true,
  autoplay = false,
  onSelect,
  onMove,
  onCreate,
  onRename,
  onDelete,
  className = "",
}: {
  tree?: TreeNode[];
  /** the root folder's name in the header */
  name?: string;
  defaultOpen?: string[];
  /** let files and folders be dragged into other folders */
  draggable?: boolean;
  /** allow new files and folders, renaming and deleting */
  editable?: boolean;
  /** open, select and move things by itself until the first interaction */
  autoplay?: boolean;
  onSelect?: (node: TreeNode) => void;
  onMove?: (node: TreeNode, folderId: string | null, tree: TreeNode[]) => void;
  onCreate?: (node: TreeNode, folderId: string | null, tree: TreeNode[]) => void;
  onRename?: (node: TreeNode, previous: string, tree: TreeNode[]) => void;
  onDelete?: (node: TreeNode, tree: TreeNode[]) => void;
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const reduced = useReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const inView = useInView(root, { amount: 0.4 });
  const touched = useRef(false);

  const [nodes, setNodesState] = useState<TreeNode[]>(tree);
  const nodesRef = useRef(nodes);
  const setNodes = (n: TreeNode[]) => {
    nodesRef.current = n;
    setNodesState(n);
  };
  const [open, setOpenState] = useState<Set<string>>(() => new Set(defaultOpen));
  const openRef = useRef(open);
  const setOpen = (fn: (s: Set<string>) => Set<string>) => {
    const next = fn(openRef.current);
    openRef.current = next;
    setOpenState(next);
  };
  const [sel, setSel] = useState<string | null>(null);
  const selRef = useRef(sel);
  const [focused, setFocused] = useState(false);
  const [pulse, setPulse] = useState({ id: "", n: 0 });

  const rows = useMemo(() => flatten(nodes, open), [nodes, open]);
  const rowsRef = useRef(rows);
  const indexOf = useMemo(() => new Map(rows.map((r, i) => [r.node.id, i])), [rows]);

  // rows that were already on screen last time animate without the pour delay
  const [seen] = useState(() => new SeenRows(rows.map((r) => r.node.id)));
  useEffect(() => {
    seen.commit(rows.map((r) => r.node.id));
  }, [rows, seen]);

  /* ------------------------------------------------------------ opening */
  const bounce = (id: string) => setPulse((p) => ({ id, n: p.n + 1 }));
  const toggle = (id: string, deep = false) => {
    const hit = findNode(nodesRef.current, id);
    if (!hit?.node.children) return;
    const isOpen = openRef.current.has(id);
    if (deep && !isOpen) {
      // a wave: each level opens a beat after the one above it
      const levels: string[][] = [];
      const walk = (n: TreeNode, d: number) => {
        if (!n.children) return;
        (levels[d] ??= []).push(n.id);
        n.children.forEach((c) => walk(c, d + 1));
      };
      walk(hit.node, 0);
      levels.forEach((ids, d) => window.setTimeout(() => setOpen((s) => new Set([...s, ...ids])), reduced ? 0 : d * 140));
      return;
    }
    if (deep) {
      const drop = new Set(folderIds(hit.node));
      setOpen((s) => new Set([...s].filter((x) => !drop.has(x))));
      return;
    }
    setOpen((s) => {
      const next = new Set(s);
      if (isOpen) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const expandAll = () => {
    const levels: string[][] = [];
    const walk = (n: TreeNode, d: number) => {
      if (!n.children) return;
      (levels[d] ??= []).push(n.id);
      n.children.forEach((c) => walk(c, d + 1));
    };
    nodesRef.current.forEach((n) => walk(n, 0));
    levels.forEach((ids, d) => window.setTimeout(() => setOpen((s) => new Set([...s, ...ids])), reduced ? 0 : d * 140));
  };
  const collapseAll = () => {
    setOpen(() => new Set());
    scroller.current?.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  };

  const choose = (id: string, focus = false) => {
    setSel(id);
    const hit = findNode(nodesRef.current, id);
    if (hit) onSelect?.(hit.node);
    if (focus) window.setTimeout(() => list.current?.querySelector<HTMLElement>(`[data-row="${CSS.escape(id)}"]`)?.focus({ preventScroll: false }), 0);
  };

  /* -------------------------------------------- making, naming, deleting */
  const [editing, setEditingState] = useState<{ id: string; isNew: boolean; value: string } | null>(null);
  const editingRef = useRef(editing);
  const setEditing = (e: typeof editing) => {
    editingRef.current = e;
    setEditingState(e);
  };
  const [exitCtx, setExitCtx] = useState<ExitCtx>({ fall: new Set(), base: 0 });
  useEffect(() => {
    if (!exitCtx.fall.size) return;
    const t = window.setTimeout(() => setExitCtx({ fall: new Set(), base: 0 }), 900);
    return () => window.clearTimeout(t);
  }, [exitCtx]);
  const [toast, setToast] = useState<{ n: number; text: string; undo?: () => void } | null>(null);
  const toastRef = useRef(toast);
  const made = useRef(0);
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast((c) => (c?.n === toast.n ? null : c)), 4200);
    return () => window.clearTimeout(t);
  }, [toast]);

  const siblingsOf = (parent: string | null) => (parent ? findNode(nodesRef.current, parent)?.node.children ?? [] : nodesRef.current);

  const create = (kind: "file" | "folder") => {
    if (editingRef.current) return;
    // inside the selected folder, or beside the selected file, like Finder
    const cur = selRef.current ? findNode(nodesRef.current, selRef.current) : null;
    const parent = cur ? (cur.node.children ? cur.node.id : cur.parent) : null;
    const name = freeName(kind === "folder" ? "untitled folder" : "untitled.tsx", siblingsOf(parent));
    const node: TreeNode = kind === "folder" ? { id: `new-${uid}-${++made.current}`, name, children: [] } : { id: `new-${uid}-${++made.current}`, name, size: 0 };
    setExitCtx({ fall: new Set(), base: 0 });
    const next = withChild(nodesRef.current, parent, node);
    setNodes(next);
    if (parent) {
      setOpen((s) => new Set([...s, parent]));
      bounce(parent);
    }
    setSel(node.id);
    setEditing({ id: node.id, isNew: true, value: name });
    onCreate?.(node, parent, next);
  };

  const startRename = (id: string) => {
    const hit = findNode(nodesRef.current, id);
    if (!hit || !editable) return;
    setSel(id);
    setEditing({ id, isNew: false, value: hit.node.name });
  };

  const commitRename = (value?: string) => {
    const e = editingRef.current;
    if (!e) return;
    setEditing(null);
    const hit = findNode(nodesRef.current, e.id);
    if (!hit) return;
    const want = (value ?? e.value).trim().replace(/[\\/]/g, "-");
    const name = want ? freeName(want, siblingsOf(hit.parent), e.id) : hit.node.name;
    if (name !== hit.node.name) {
      const next = renamed(nodesRef.current, e.id, name);
      setNodes(next);
      onRename?.({ ...hit.node, name }, hit.node.name, next);
    }
    if (touched.current) choose(e.id, true);
  };

  const remove = (id: string, quiet = false) => {
    const hit = findNode(nodesRef.current, id);
    if (!hit) return;
    const list = rowsRef.current;
    const at = list.findIndex((r) => r.node.id === id);
    // the row and everything showing inside it fall together
    const fall = new Set(list.filter((r) => within(hit.node, r.node.id)).map((r) => r.node.id));
    setExitCtx({ fall: quiet ? new Set() : fall, base: Math.max(0, at) });
    const next = without(nodesRef.current, id);
    setNodes(next);
    if (editingRef.current?.id === id) setEditing(null);
    const after = list.slice(at + 1).find((r) => !fall.has(r.node.id)) ?? list.slice(0, Math.max(0, at)).reverse()[0];
    setSel(after?.node.id ?? null);
    if (touched.current && after) choose(after.node.id, true);
    if (quiet) return;
    onDelete?.(hit.node, next);
    setToast({
      n: ++made.current,
      text: `Deleted \u201c${hit.node.name}\u201d`,
      undo: () => {
        const home = hit.parent && findNode(nodesRef.current, hit.parent) ? hit.parent : null;
        setExitCtx({ fall: new Set(), base: 0 });
        setNodes(withChild(nodesRef.current, home, hit.node));
        if (home) setOpen((s) => new Set([...s, home]));
        setSel(hit.node.id);
        if (touched.current) choose(hit.node.id, true);
      },
    });
  };
  const undo = () => {
    const t = toastRef.current;
    if (!t?.undo) return;
    t.undo();
    setToast(null);
  };

  // keep the row being named in view
  useEffect(() => {
    if (!editing) return;
    // scroll only the tree, never the page
    const t = window.setTimeout(() => {
      const el = list.current?.querySelector<HTMLElement>(`[data-row="${CSS.escape(editing.id)}"]`);
      const box = scroller.current;
      if (!el || !box) return;
      const top = el.offsetTop;
      const behavior = reduced ? "auto" : "smooth";
      if (top < box.scrollTop) box.scrollTo({ top: top - 8, behavior });
      else if (top + ROW > box.scrollTop + box.clientHeight - 12) box.scrollTo({ top: top + ROW - box.clientHeight + 20, behavior });
    }, 160);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing?.id]);

  /* ----------------------------------------------------------- dragging */
  const gx = useMotionValue(0);
  const gy = useMotionValue(0);
  const lean = useSpring(useTransform(useVelocity(gx), (v) => Math.max(-9, Math.min(9, v * 0.012))), { stiffness: 320, damping: 18 });
  const [drag, setDrag] = useState<{ id: string; over: string | null | undefined; flying: boolean } | null>(null);
  const dragRef = useRef(drag);
  // handlers and the drag physics read these; keep them current as soon as the layout commits
  useLayoutEffect(() => {
    selRef.current = sel;
    rowsRef.current = rows;
    toastRef.current = toast;
    dragRef.current = drag;
  });
  const pending = useRef<{ id: string; x0: number; y0: number; ox: number; oy: number; pid: number } | null>(null);
  const suppress = useRef(false);
  const springTimer = useRef(0);

  const local = (cx: number, cy: number) => {
    const r = list.current!.getBoundingClientRect();
    return { x: cx - r.left, y: cy - r.top };
  };
  const homeOf = (id: string) => {
    const el = list.current?.querySelector<HTMLElement>(`[data-row="${CSS.escape(id)}"]`);
    const r = rowsRef.current.find((x) => x.node.id === id);
    return { x: 4 + (r?.depth ?? 0) * INDENT, y: el ? el.offsetTop : 0 };
  };

  // where would a drop land? folders take it; a file passes it to its folder; empty space is the root
  const targetFor = (id: string, overId: string | null | undefined): string | null | undefined => {
    const moving = findNode(nodesRef.current, id);
    if (!moving) return undefined;
    let target: string | null | undefined = overId === undefined ? undefined : overId;
    if (typeof target === "string") {
      const hit = findNode(nodesRef.current, target);
      if (!hit) return undefined;
      if (!hit.node.children) target = hit.parent;
    }
    if (target === undefined) return undefined;
    if (target !== null && within(moving.node, target)) return undefined;
    return target;
  };

  const hoverTarget = (t: string | null | undefined) => {
    const d = dragRef.current;
    if (!d || d.over === t) return;
    setDrag({ ...d, over: t });
    window.clearTimeout(springTimer.current);
    // spring-loaded folders: hold over a closed one and it opens
    if (typeof t === "string" && !openRef.current.has(t)) {
      springTimer.current = window.setTimeout(() => {
        if (dragRef.current?.over !== t) return;
        setOpen((s) => new Set([...s, t]));
        bounce(t);
      }, 650);
    }
  };

  const begin = (id: string, x: number, y: number) => {
    gx.set(x);
    gy.set(y);
    setDrag({ id, over: undefined, flying: false });
  };

  const finish = (land: boolean) => {
    const d = dragRef.current;
    window.clearTimeout(springTimer.current);
    if (!d) return;
    const moving = findNode(nodesRef.current, d.id);
    const target = d.over;
    if (!land || !moving || target === undefined || target === moving.parent) {
      // nowhere to go: back where it came from
      const home = homeOf(d.id);
      setDrag({ ...d, over: undefined, flying: true });
      const done = () => setDrag(null);
      if (reduced) return done();
      animate(gx, home.x, POUR);
      animate(gy, home.y, { ...POUR, onComplete: done });
      return;
    }
    const next = withChild(without(nodesRef.current, d.id), target, moving.node);
    setNodes(next);
    if (target) {
      setOpen((s) => new Set([...s, target]));
      bounce(target);
    }
    setSel(d.id);
    setDrag({ ...d, over: undefined, flying: true });
    onMove?.(moving.node, target, next);
  };
  // after a move, fly the lifted copy to the row's new home, then show the row
  useLayoutEffect(() => {
    const d = dragRef.current;
    if (!d?.flying) return;
    const home = homeOf(d.id);
    const done = () => setDrag(null);
    if (reduced) return done();
    animate(gx, home.x, POUR);
    const a = animate(gy, home.y, { ...POUR, onComplete: done });
    return () => a.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes]);

  const onRowDown = (id: string) => (e: RPointerEvent<HTMLDivElement>) => {
    touched.current = true;
    // drag with a mouse or pen; on touch the list scrolls instead
    if (!draggable || e.button !== 0 || e.pointerType === "touch" || dragRef.current || editingRef.current) return;
    const p = local(e.clientX, e.clientY);
    const r = e.currentTarget;
    pending.current = { id, x0: e.clientX, y0: e.clientY, ox: p.x - (4 + (rowsRef.current.find((x) => x.node.id === id)?.depth ?? 0) * INDENT), oy: p.y - r.offsetTop, pid: e.pointerId };
    r.setPointerCapture(e.pointerId);
  };
  const onListMove = (e: RPointerEvent<HTMLDivElement>) => {
    const p0 = pending.current;
    if (!p0 || p0.pid !== e.pointerId) return;
    const p = local(e.clientX, e.clientY);
    if (!dragRef.current) {
      if (Math.hypot(e.clientX - p0.x0, e.clientY - p0.y0) < 5) return;
      begin(p0.id, p.x - p0.ox, p.y - p0.oy);
      suppress.current = true;
    }
    gx.set(p.x - p0.ox);
    gy.set(p.y - p0.oy);
    // what is under the pointer (the lifted copy ignores the pointer)
    const under = document.elementFromPoint(e.clientX, e.clientY);
    const rowEl = under?.closest<HTMLElement>("[data-row]");
    const inList = !!under && !!list.current?.contains(under);
    hoverTarget(rowEl ? targetFor(p0.id, rowEl.dataset.row!) : inList ? targetFor(p0.id, null) : undefined);
    // nudge the scroll near the edges
    const s = scroller.current;
    if (s) {
      const r = s.getBoundingClientRect();
      if (e.clientY < r.top + 28) s.scrollTop -= 8;
      else if (e.clientY > r.bottom - 28) s.scrollTop += 8;
    }
  };
  const onListUp = (e: RPointerEvent<HTMLDivElement>) => {
    const p0 = pending.current;
    if (!p0 || p0.pid !== e.pointerId) return;
    pending.current = null;
    if (dragRef.current && !dragRef.current.flying) finish(true);
    window.setTimeout(() => (suppress.current = false), 0);
  };

  /* ----------------------------------------------------------- keyboard */
  const typed = useRef({ text: "", at: 0 });
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    touched.current = true;
    if (dragRef.current) {
      if (e.key === "Escape") finish(false);
      return;
    }
    const list = rowsRef.current;
    if (!sel || !list.some((x) => x.node.id === sel)) {
      if (list[0] && e.key.startsWith("Arrow")) {
        e.preventDefault();
        choose(list[0].node.id, true);
      }
      return;
    }
    const i = list.findIndex((r) => r.node.id === sel);
    const r = list[i];
    if (!r) return;
    const isFolder = !!r.node.children;
    const isOpen = openRef.current.has(r.node.id);
    const go = (j: number) => list[j] && choose(list[j].node.id, true);
    switch (e.key) {
      case "ArrowDown":
        go(Math.min(list.length - 1, i + 1));
        break;
      case "ArrowUp":
        go(Math.max(0, i - 1));
        break;
      case "Home":
        go(0);
        break;
      case "End":
        go(list.length - 1);
        break;
      case "ArrowRight":
        if (isFolder && (!isOpen || e.altKey)) toggle(r.node.id, e.altKey);
        else if (isFolder) go(i + 1);
        break;
      case "ArrowLeft":
        if (isFolder && isOpen) toggle(r.node.id, e.altKey);
        else if (r.parent) choose(r.parent, true);
        break;
      case "Enter":
        // Return renames, as in Finder
        if (editable) startRename(r.node.id);
        else if (isFolder) toggle(r.node.id, e.altKey);
        break;
      case " ":
        if (isFolder) toggle(r.node.id, e.altKey);
        break;
      case "Delete":
      case "Backspace":
        if (!editable) return;
        remove(r.node.id);
        break;
      default: {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z" && toastRef.current?.undo) {
          undo();
          break;
        }
        if (e.key.length !== 1 || e.metaKey || e.ctrlKey) return;
        // type to jump, like Finder
        const now = e.timeStamp;
        const t = typed.current;
        t.text = now - t.at < 700 ? t.text + e.key.toLowerCase() : e.key.toLowerCase();
        t.at = now;
        const order = [...list.slice(i + (t.text.length === 1 ? 1 : 0)), ...list.slice(0, i + (t.text.length === 1 ? 1 : 0))];
        const hit = order.find((x) => x.node.name.toLowerCase().replace(/^\(/, "").startsWith(t.text));
        if (hit) choose(hit.node.id, true);
      }
    }
    e.preventDefault();
  };

  /* ----------------------------------------------------------- autoplay */
  useEffect(() => {
    if (!autoplay || !inView) return;
    let alive = true;
    const ok = () => alive && !touched.current;
    const wait = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));
    const walk = async (ids: string[], gap = 260) => {
      for (const id of ids) {
        if (!ok()) return;
        setSel(id);
        await wait(gap);
      }
    };
    (async () => {
      await wait(900);
      while (ok()) {
        await walk(["app", "app/marketing", "app/globals", "app/layout", "app/page", "components"], 230);
        if (!ok()) return;
        toggle("components", true);
        await wait(1300);
        if (!ok()) return;
        await walk(["components/ui", "components/ui/button", "components/ui/dialog", "components/ui/tooltip", "components/hero", "components/pricing"], 220);
        await wait(300);
        if (!ok()) return;
        // pick up pricing.tsx and carry it into (marketing), which springs open on the way
        const from = homeOf("components/pricing");
        begin("components/pricing", from.x, from.y);
        animate(gx, from.x + 10, { duration: 0.2 });
        await wait(220);
        const over = homeOf("app/marketing");
        animate(gx, over.x + 30, { type: "spring", stiffness: 90, damping: 16 });
        await new Promise<void>((r) => animate(gy, over.y, { type: "spring", stiffness: 90, damping: 16, onComplete: () => r() }));
        if (!ok()) return finish(false);
        hoverTarget("app/marketing");
        await wait(1100);
        if (!ok()) return finish(false);
        finish(true);
        await wait(1600);
        if (!ok()) return;
        // a new file in lib, named as it is typed
        setSel("lib");
        await wait(450);
        if (!ok()) return;
        create("file");
        await wait(800);
        for (const part of ["u", "us", "use", "use-", "use-c", "use-ca", "use-car", "use-cart", "use-cart.", "use-cart.t", "use-cart.ts"]) {
          if (!ok()) return;
          const e = editingRef.current;
          if (e) setEditing({ ...e, value: part });
          await wait(65);
        }
        await wait(350);
        if (!ok()) return;
        commitRename();
        await wait(1300);
        if (!ok()) return;
        // delete README.md, then take it back
        setSel("readme");
        await wait(500);
        if (!ok()) return;
        remove("readme");
        await wait(1500);
        if (!ok()) return;
        undo();
        await wait(1400);
        if (!ok()) return;
        collapseAll();
        setSel(null);
        await wait(900);
        if (!ok()) return;
        setNodes(tree);
        setOpen(() => new Set(defaultOpen));
        await wait(1500);
      }
    })();
    return () => {
      alive = false;
    };
    // a fixed script
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, inView]);

  /* ---------------------------------------------------- selection pill */
  // The pill follows the chosen row where it actually is on screen, read after framer has drawn the
  // frame, so it rides exactly with rows that slide open, shut or close a gap; a change of choice
  // leaves a gap that eases away, which is the glide.
  const pillEl = useRef<HTMLDivElement>(null);
  const pillPos = useRef(0);
  const [selTop, setSelTop] = useState<number | null>(null);
  const placePill = (y: number) => {
    pillPos.current = y;
    if (pillEl.current) pillEl.current.style.transform = `translateY(${y}px)`;
  };
  useLayoutEffect(() => {
    const box = list.current;
    const el = sel ? box?.querySelector<HTMLElement>(`[data-row="${CSS.escape(sel)}"]`) : null;
    if (!box || !el || !indexOf.has(sel!)) return setSelTop(null);
    const visualTop = () => el.getBoundingClientRect().top - box.getBoundingClientRect().top + 1;
    setSelTop(el.offsetTop + 1);
    if (selTop === null || reduced) return placePill(el.offsetTop + 1);
    const until = performance.now() + 950;
    let last = performance.now();
    let gap = pillPos.current - visualTop();
    const step = () => {
      const now = performance.now();
      if (!el.isConnected) return cancelFrame(step);
      const dt = Math.min(48, now - last);
      last = now;
      gap *= Math.exp(-dt / 50);
      if (Math.abs(gap) < 0.3) gap = 0;
      placePill(visualTop() + gap);
      if (now > until) {
        cancelFrame(step);
        placePill(el.offsetTop + 1);
      }
    };
    frame.postRender(step, true);
    return () => cancelFrame(step);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sel, rows]);

  /* ------------------------------------------------------------- render */
  const tabStop = sel && indexOf.has(sel) ? sel : rows[0]?.node.id;
  const dragged = drag ? findNode(nodes, drag.id)?.node : null;
  const iconBtn =
    "grid h-8 w-8 cursor-pointer place-items-center rounded-full border-0 bg-transparent p-0 text-[#6e6e73] outline-none transition-colors hover:bg-[#f5f5f7] hover:text-[#1d1d1f] focus-visible:ring-2 focus-visible:ring-[#0071e3]";

  return (
    <div ref={root} onPointerDown={() => (touched.current = true)} className={`w-full max-w-[440px] overflow-hidden rounded-[24px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] ${className}`}>
      <div className="flex items-center justify-between gap-3 border-b border-black/[.06] py-2.5 pl-4 pr-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex shrink-0 text-[#3ea6ff]">
            <Icon name="folder_fill" size={18} />
          </span>
          <span className="truncate text-[14px] font-semibold tracking-[-0.01em] text-[#1d1d1f]">{name}</span>
          <span className="shrink-0 text-[12.5px] tabular-nums text-[#86868b]">{total(nodes)} items</span>
        </div>
        <div className="flex shrink-0 items-center">
          {editable && (
            <>
              <button type="button" aria-label="New file" title="New file" onClick={() => ((touched.current = true), create("file"))} className={iconBtn}>
                <Icon name="square_pencil" size={16} />
              </button>
              <button type="button" aria-label="New folder" title="New folder" onClick={() => ((touched.current = true), create("folder"))} className={iconBtn}>
                <Icon name="folder_badge_plus" size={17} />
              </button>
              <span className="mx-1 h-4 w-px bg-black/10" />
            </>
          )}
          <button type="button" aria-label="Open all folders" title="Open all folders" onClick={() => ((touched.current = true), expandAll())} className={iconBtn}>
            <Icon name="rectangle_expand_vertical" size={16} />
          </button>
          <button type="button" aria-label="Close all folders" title="Close all folders" onClick={() => ((touched.current = true), collapseAll())} className={iconBtn}>
            <Icon name="rectangle_compress_vertical" size={16} />
          </button>
        </div>
      </div>

      <div className="relative">
      <div ref={scroller} className="h-[360px] overflow-y-auto overflow-x-hidden overscroll-contain px-1.5 py-1.5 [scrollbar-width:thin]">
        <div
          ref={list}
          role="tree"
          aria-label={`${name} files`}
          onKeyDown={onKey}
          onFocus={() => setFocused(true)}
          onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && setFocused(false)}
          onPointerMove={onListMove}
          onPointerUp={onListUp}
          onPointerCancel={onListUp}
          className={`relative isolate min-h-full rounded-[10px] outline-none transition-shadow duration-150 ${drag?.over === null ? "shadow-[inset_0_0_0_2px_#0071e3]" : ""}`}
        >
          {/* the selection: one pill behind every row, gliding to the chosen one */}
          <motion.div ref={pillEl} aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 rounded-[7px]" initial={false} animate={{ opacity: selTop === null ? 0 : 1, backgroundColor: focused ? "#0071e3" : "#e3e3e8" }} transition={{ duration: 0.15 }} style={{ height: ROW - 2 }} />
          <AnimatePresence initial={false} mode="popLayout" custom={exitCtx}>
            {rows.map((r, i) => {
              const id = r.node.id;
              const folder = !!r.node.children;
              const isOpen = folder && open.has(id);
              const k = r.parent && indexOf.has(r.parent) ? i - indexOf.get(r.parent)! : 0;
              const fresh = !seen.has(id);
              const selected = sel === id;
              const hot = selected && focused;
              const target = drag?.over === id;
              const hidden = drag?.id === id && drag.flying;
              const lifted = drag?.id === id && !drag.flying;
              const l = look(r.node);
              const naming = editing?.id === id;
              return (
                <TreeRow
                  key={id}
                  id={id}
                  index={i}
                  exitCtx={exitCtx}
                  k={k}
                  fresh={fresh}
                  reduced={!!reduced}
                  depth={r.depth}
                  opacity={hidden ? 0 : lifted ? 0.35 : 1}
                  delay={fresh && !reduced ? Math.min(0.3, Math.max(0, k - 1) * 0.04) : 0}
                  rowProps={{
                    "data-row": id,
                    role: "treeitem",
                    "aria-level": r.depth + 1,
                    "aria-posinset": r.pos,
                    "aria-setsize": r.set,
                    "aria-expanded": folder ? isOpen : undefined,
                    "aria-selected": selected,
                    "aria-label": `${r.node.name}${folder ? `, folder, ${r.node.children!.length} items` : `, ${bytes(r.node.size)}`}`,
                    tabIndex: tabStop === id ? 0 : -1,
                    onPointerDown: onRowDown(id),
                    onFocus: () => !sel && setSel(id),
                    onClick: (e: RMouseEvent<HTMLDivElement>) => {
                      if (suppress.current || naming) return;
                      touched.current = true;
                      choose(id);
                      if (folder && e.detail < 2) toggle(id, e.altKey);
                    },
                    onDoubleClick: () => {
                      // double-click to rename (the row holds the pointer, so the whole row is the target)
                      if (!editable) return;
                      touched.current = true;
                      if (folder) toggle(id);
                      startRename(id);
                    },
                  }}
                >
                  {!selected && <span className="absolute inset-x-0 inset-y-[1px] rounded-[7px] opacity-0 transition-opacity duration-100 group-hover:opacity-100" style={{ background: "#f5f5f7" }} />}
                  {target && <motion.span data-drop initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={GLIDE} className="absolute inset-x-0 inset-y-[1px] rounded-[7px]" style={{ background: "rgba(0,113,227,.12)", boxShadow: "inset 0 0 0 2px #0071e3" }} />}
                  <span className="relative flex w-4 shrink-0 justify-center" style={{ color: hot ? "rgba(255,255,255,.85)" : "#86868b" }}>
                    {folder && (
                      <motion.span className="flex" initial={false} animate={{ rotate: isOpen ? 90 : 0 }} transition={{ type: "spring", stiffness: 560, damping: 26 }}>
                        <Icon name="chevron_right" size={10} />
                      </motion.span>
                    )}
                  </span>
                  <motion.span
                    key={pulse.id === id ? pulse.n : 0}
                    className="relative ml-1 flex shrink-0"
                    style={{ color: hot ? "#fff" : l.tint }}
                    initial={pulse.id === id && pulse.n ? { scale: 1 } : false}
                    animate={pulse.id === id && pulse.n ? { scale: [1, 1.32, 0.9, 1.06, 1], y: [0, -3, 0, 0, 0] } : {}}
                    transition={{ duration: 0.55 }}
                  >
                    <Icon name={l.icon} size={folder ? 17 : 15} />
                  </motion.span>
                  {naming ? (
                    <input
                      aria-label={`Name for ${r.node.name}`}
                      value={editing!.value}
                      // a real visitor gets the cursor straight away; the autoplay demo never takes focus
                      ref={(el) => {
                        if (el && touched.current && document.activeElement !== el) el.focus({ preventScroll: true });
                      }}
                      spellCheck={false}
                      onChange={(e) => setEditing({ ...editing!, value: e.target.value })}
                      onFocus={(e) => {
                        const v = e.currentTarget.value;
                        const dot = folder ? -1 : v.lastIndexOf(".");
                        e.currentTarget.setSelectionRange(0, dot > 0 ? dot : v.length);
                      }}
                      onKeyDown={(e) => {
                        e.stopPropagation();
                        if (e.key === "Enter") commitRename(e.currentTarget.value);
                        if (e.key === "Escape") {
                          const was = editingRef.current;
                          setEditing(null);
                          // a brand-new item that is escaped simply goes back in
                          if (was?.isNew) remove(was.id, true);
                          else if (was) choose(was.id, true);
                        }
                      }}
                      onBlur={(e) => editingRef.current?.id === id && commitRename(e.currentTarget.value)}
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                      className="relative z-[1] ml-1.5 mr-2 h-[22px] min-w-0 flex-1 rounded-[5px] border-0 bg-white px-1.5 text-[13.5px] text-[#1d1d1f] shadow-[0_0_0_2px_#0071e3,0_2px_6px_rgba(0,0,0,.12)] outline-none [font-family:inherit]"
                    />
                  ) : (
                    <span data-name className="relative ml-2 min-w-0 flex-1 truncate text-[13.5px] transition-colors duration-150" style={{ color: hot ? "#fff" : "#1d1d1f" }}>
                      {r.node.name}
                    </span>
                  )}
                  {!naming && (
                    <span className="relative ml-2 grid shrink-0 justify-items-end pr-1.5">
                      <span
                        className={`pointer-events-none col-start-1 row-start-1 self-center pr-1 text-[12px] tabular-nums transition-opacity duration-100 ${editable ? (selected ? "opacity-0" : "group-hover:opacity-0") : ""}`}
                        style={{ color: hot ? "rgba(255,255,255,.8)" : "#86868b" }}
                      >
                        {folder ? `${r.node.children!.length} ${r.node.children!.length === 1 ? "item" : "items"}` : bytes(r.node.size)}
                      </span>
                      {editable && (
                        <button
                          type="button"
                          tabIndex={-1}
                          aria-label={`Delete ${r.node.name}`}
                          title="Delete"
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            e.stopPropagation();
                            touched.current = true;
                            remove(id);
                          }}
                          className={`relative z-[1] col-start-1 row-start-1 grid h-6 w-6 cursor-pointer place-items-center rounded-full border-0 bg-transparent p-0 outline-none transition-[opacity,background-color,color] duration-100 ${selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"} ${hot ? "text-white hover:bg-white/20" : "text-[#86868b] hover:bg-[#ff3b30]/10 hover:text-[#ff3b30]"}`}
                        >
                          <Icon name="trash" size={13} />
                        </button>
                      )}
                    </span>
                  )}
                </TreeRow>
              );
            })}
          </AnimatePresence>

          {/* the lifted copy that follows your pointer */}
          <AnimatePresence>
            {drag && dragged && (
              <motion.div key="ghost" aria-hidden="true" className="pointer-events-none absolute left-0 top-0 z-[60]" style={{ x: gx, y: gy, rotate: lean }} exit={{ opacity: 0, transition: { duration: 0.1 } }}>
                <motion.div
                  initial={{ scale: 0.92, opacity: 0 }}
                  animate={{ scale: drag.flying ? 1 : 1.05, opacity: 1, boxShadow: drag.flying ? "0 0 0 0 rgba(0,0,0,0)" : "0 14px 30px -10px rgba(0,0,0,.35), 0 0 0 .5px rgba(0,0,0,.12)" }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="flex h-[30px] items-center gap-2 whitespace-nowrap rounded-[8px] bg-white pl-[22px] pr-3"
                >
                  <span className="flex" style={{ color: look(dragged).tint }}>
                    <Icon name={look(dragged).icon} size={dragged.children ? 17 : 15} />
                  </span>
                  <span className="text-[13.5px] text-[#1d1d1f]">{dragged.name}</span>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-3 z-[70] flex justify-center px-3">
        <AnimatePresence>
          {toast && (
            <motion.div
              key={toast.n}
              role="status"
              initial={{ opacity: 0, y: 16, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97, transition: { duration: 0.16 } }}
              transition={{ type: "spring", stiffness: 520, damping: 32 }}
              className="pointer-events-auto flex max-w-full items-center gap-3 rounded-full bg-[#1d1d1f] py-1.5 pl-4 pr-1.5 text-[13px] text-white shadow-[0_12px_30px_-12px_rgba(0,0,0,.6)]"
            >
              <span className="min-w-0 truncate">{toast.text}</span>
              {toast.undo && (
                <button
                  type="button"
                  onClick={() => ((touched.current = true), undo())}
                  className="flex shrink-0 cursor-pointer items-center gap-1 rounded-full border-0 bg-white/[.14] px-2.5 py-1 text-[12.5px] font-medium text-white outline-none [font-family:inherit] hover:bg-white/[.22] focus-visible:ring-2 focus-visible:ring-white/70"
                >
                  <Icon name="arrow_uturn_left" size={12} />
                  Undo
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      </div>

      <p className="m-0 border-t border-black/[.06] px-4 py-2.5 text-[12px] leading-[1.4] text-[#86868b]">
        {editable ? "Return renames, Delete removes, Option-click opens everything inside. Drag onto a folder, or hold over a closed one and it springs open." : "Option-click opens everything inside. Drag onto a folder, or hold over a closed one and it springs open."}
      </p>
    </div>
  );
}

export default FolderTree;
