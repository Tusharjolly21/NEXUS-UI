"use client";

import { forwardRef, useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent, type MouseEvent as RMouseEvent, type PointerEvent as RPointerEvent } from "react";
import { AnimatePresence, motion, useAnimationControls, useInView } from "framer-motion";

// Icons: Framework7 Icons (MIT) via Iconify, SF Symbols style. Inlined so the file has no icon dependency.
const ICON = {
  pencil: "<path fill=\"currentColor\" d=\"m43.293 16.926l2.367-2.32c1.196-1.196 1.242-2.485.188-3.563l-.797-.797c-1.055-1.055-2.344-.937-3.54.211l-2.367 2.344ZM15.66 44.488l25.57-25.547l-4.101-4.125l-25.594 25.57L9.31 45.59c-.211.562.375 1.219.937.984Z\"/>",
  doc_on_doc: "<path fill=\"currentColor\" d=\"M11.505 56h21.4c4.561 0 6.721-2.314 6.721-6.92v-4.077h4.298c4.54 0 6.81-2.314 6.81-6.92V19.636c0-2.71-.53-4.43-2.182-6.126L37.422 2.182C35.836.573 34.006 0 31.648 0h-9.013c-4.54 0-6.833 2.314-6.833 6.92v4.077h-4.297c-4.54 0-6.832 2.314-6.832 6.92V49.08c0 4.628 2.292 6.92 6.832 6.92m28.121-24.683c0-2.821-.33-4.055-2.093-5.863L25.389 13.092c-1.675-1.72-3.063-2.094-5.553-2.094h-.485V6.964c0-2.16 1.19-3.416 3.46-3.416h9.3v11.526c0 2.535 1.256 3.769 3.769 3.769h11.306v19.196c0 2.181-1.169 3.416-3.46 3.416h-4.1Zm-3.217-15.67c-.794 0-1.102-.33-1.102-1.101V4.253l11.195 11.394ZM11.68 52.452c-2.27 0-3.46-1.234-3.46-3.438V17.96c0-2.16 1.19-3.415 3.482-3.415h7.648v12.782c0 2.777 1.41 4.143 4.143 4.143h12.584v17.543c0 2.204-1.19 3.438-3.482 3.438Zm12.232-24.309c-.882 0-1.234-.352-1.234-1.212V15.23l12.716 12.914Z\"/>",
  link: "<path fill=\"currentColor\" d=\"m27.707 37.656l3.117-3.164c-3.093-.234-5.109-1.172-6.632-2.695c-4.102-4.102-4.079-9.914-.024-13.969l7.64-7.64c4.102-4.079 9.868-4.102 13.946 0c4.125 4.101 4.078 9.89.024 13.945l-4.594 4.594c.656 1.5.797 3.234.562 4.757l6.867-6.867c5.626-5.625 5.672-13.57-.023-19.265s-13.64-5.649-19.266-.024l-7.992 8.016c-5.625 5.625-5.672 13.594.024 19.265c1.476 1.477 3.351 2.532 6.351 3.047m.586-19.312l-3.117 3.164c3.094.258 5.11 1.172 6.633 2.695c4.101 4.102 4.078 9.914.023 13.969l-7.664 7.64c-4.078 4.079-9.867 4.102-13.945.024c-4.102-4.125-4.078-9.89 0-13.969l4.593-4.594c-.656-1.476-.82-3.234-.585-4.757l-6.868 6.867c-5.601 5.625-5.648 13.594.024 19.265c5.695 5.696 13.664 5.649 19.266.047l8.015-8.039c5.625-5.625 5.672-13.593-.023-19.265c-1.477-1.477-3.352-2.532-6.352-3.047\"/>",
  folder: "<path fill=\"currentColor\" d=\"M8.453 49.75h39.82c4.195 0 6.633-2.437 6.633-7.266v-24.68c0-4.827-2.46-7.241-7.336-7.241H24.766c-1.594 0-2.555-.399-3.727-1.383l-1.43-1.196c-1.547-1.289-2.742-1.734-5.062-1.734H7.562c-4.101 0-6.468 2.344-6.468 7.078v29.156c0 4.852 2.484 7.266 7.359 7.266M4.867 13.516c0-2.32 1.242-3.492 3.469-3.492h5.25c1.547 0 2.484.374 3.68 1.406l1.43 1.172c1.523 1.265 2.765 1.734 5.085 1.734H47.5c2.32 0 3.633 1.242 3.633 3.68v1.406H4.867Zm3.656 32.46c-2.343 0-3.656-1.242-3.656-3.68V22.962h46.266v19.36c0 2.413-1.313 3.656-3.633 3.656Z\"/>",
  folder_fill: "<path fill=\"currentColor\" d=\"M47.57 10.563H24.766c-1.594 0-2.555-.399-3.727-1.383l-1.43-1.196c-1.547-1.289-2.742-1.734-5.062-1.734H7.562c-4.101 0-6.468 2.344-6.468 7.078v6.258h53.812v-1.781c0-4.828-2.46-7.242-7.336-7.242M8.453 49.75h39.82c4.195 0 6.633-2.437 6.633-7.266v-19.71H1.094v19.71c0 4.852 2.484 7.266 7.359 7.266\"/>",
  pin: "<path fill=\"currentColor\" d=\"M13.422 35.969h12.516v12.047c0 3.562 1.5 6.562 2.085 6.562c.563 0 2.063-3 2.063-6.562V35.969h12.492c1.617 0 2.79-1.032 2.79-2.602c0-.984-.306-1.687-.985-2.414l-7.172-7.781c-.492-.516-.797-.89-.68-1.852l1.196-8.554c.07-.492.117-.774.562-1.078l5.742-4.172c1.29-.938 1.852-2.086 1.852-3.141c0-1.57-1.266-2.953-3.07-2.953H13.186c-1.804 0-3.07 1.383-3.07 2.953c0 1.055.563 2.203 1.828 3.14l5.766 4.173c.445.304.492.585.562 1.078l1.196 8.554c.14.961-.188 1.336-.68 1.852l-7.172 7.781c-.68.727-.984 1.43-.984 2.414c0 1.57 1.172 2.602 2.789 2.602m3.047-3.774c-.211 0-.352-.14-.352-.351c0-.14.094-.282.211-.399l6-6.28c.774-.774 1.078-1.618.985-2.485l-1.454-11.297c-.117-.914-.422-1.594-1.101-2.063l-5.086-3.375c-.164-.117-.211-.234-.211-.398c0-.211.164-.352.375-.352h24.328c.211 0 .375.14.375.352c0 .164-.047.281-.21.398L35.241 9.32c-.68.47-.984 1.149-1.101 2.063L32.688 22.68c-.094.867.21 1.71.96 2.484l6.024 6.281a.58.58 0 0 1 .187.399c0 .21-.117.351-.328.351Z\"/>",
  pin_fill: "<path fill=\"currentColor\" d=\"M14.254 35.969h11.695v12.047c0 3.562 1.477 6.562 2.063 6.562s2.062-3 2.062-6.562V35.969h11.672c1.617 0 2.79-1.032 2.79-2.602c0-.984-.306-1.687-.985-2.414l-7.172-7.781c-.492-.516-.797-.89-.68-1.852l1.196-8.554c.07-.492.117-.774.539-1.078l5.765-4.172c1.29-.938 1.852-2.086 1.852-3.141c0-1.57-1.266-2.953-3.07-2.953H14.02c-1.805 0-3.07 1.383-3.07 2.953c0 1.055.562 2.203 1.827 3.14l5.766 4.173c.445.304.492.585.562 1.078l1.196 8.554c.117.961-.188 1.336-.68 1.852l-7.172 7.781c-.68.727-.984 1.43-.984 2.414c0 1.57 1.172 2.602 2.789 2.602\"/>",
  star: "<path fill=\"currentColor\" d=\"M11.969 52.293c.96.727 2.18.469 3.633-.586L28 42.613l12.422 9.094c1.453 1.055 2.648 1.313 3.633.586c.96-.727 1.172-1.922.586-3.633l-4.899-14.578l12.516-9c1.453-1.031 2.039-2.11 1.664-3.281c-.375-1.125-1.477-1.688-3.281-1.664l-15.352.093l-4.664-14.648C30.063 3.848 29.22 2.981 28 2.981c-1.195 0-2.039.867-2.602 2.601L20.734 20.23l-15.351-.093c-1.805-.024-2.906.539-3.281 1.664c-.399 1.172.21 2.25 1.664 3.281l12.515 9l-4.898 14.578c-.586 1.711-.375 2.906.586 3.633m3.375-4.64c-.047-.047-.024-.071 0-.212l4.664-13.406c.305-.914.14-1.64-.68-2.203L7.656 23.77c-.117-.07-.14-.118-.117-.188s.07-.07.211-.07l14.18.258c.96.023 1.57-.375 1.875-1.336l4.055-13.57c.046-.141.093-.188.14-.188c.07 0 .117.047.14.187l4.079 13.57c.281.962.914 1.36 1.875 1.337l14.18-.258c.14 0 .187 0 .21.07c.024.07-.023.117-.117.188l-11.672 8.062c-.82.563-1.007 1.29-.68 2.203l4.665 13.406c.023.141.047.164 0 .211c-.047.07-.117.024-.211-.047l-11.274-8.601c-.75-.586-1.617-.586-2.367 0l-11.273 8.602c-.094.07-.164.117-.211.046\"/>",
  star_fill: "<path fill=\"currentColor\" d=\"M11.969 52.293c.96.727 2.18.469 3.633-.586L28 42.613l12.422 9.094c1.453 1.055 2.648 1.313 3.633.586c.96-.727 1.172-1.922.586-3.633l-4.899-14.578l12.516-9c1.453-1.031 2.039-2.11 1.664-3.281c-.375-1.125-1.477-1.688-3.281-1.664l-15.352.093l-4.664-14.648C30.063 3.848 29.22 2.981 28 2.981c-1.195 0-2.039.867-2.602 2.601L20.734 20.23l-15.351-.093c-1.805-.024-2.906.539-3.281 1.664c-.399 1.172.21 2.25 1.664 3.281l12.515 9l-4.898 14.578c-.586 1.711-.375 2.906.586 3.633\"/>",
  trash: "<path fill=\"currentColor\" d=\"m44.524 48.66l1.617-34.265h2.343c.961 0 1.735-.797 1.735-1.758s-.774-1.782-1.735-1.782H38.242V7.34c0-3.352-2.273-5.531-5.882-5.531h-8.766c-3.61 0-5.86 2.18-5.86 5.53v3.516H7.54c-.937 0-1.758.82-1.758 1.782c0 .96.82 1.758 1.758 1.758h2.344L11.5 48.684c.164 3.375 2.39 5.507 5.766 5.507h21.492c3.351 0 5.601-2.156 5.765-5.53M21.484 7.574c0-1.336.985-2.273 2.391-2.273h8.227c1.43 0 2.414.937 2.414 2.273v3.281H21.484Zm-3.867 43.102c-1.36 0-2.367-1.032-2.437-2.39l-1.64-33.891h28.85l-1.546 33.89c-.07 1.383-1.055 2.39-2.438 2.39Zm17.344-4.125c.773 0 1.36-.633 1.383-1.524l.703-24.75c.023-.89-.586-1.547-1.383-1.547c-.726 0-1.336.68-1.36 1.524l-.702 24.773c-.024.844.562 1.524 1.359 1.524m-13.898 0c.797 0 1.382-.68 1.359-1.524l-.703-24.773c-.024-.844-.656-1.524-1.383-1.524c-.797 0-1.383.657-1.36 1.547l.727 24.75c.024.891.586 1.524 1.36 1.524m8.367-1.524V20.254c0-.844-.633-1.524-1.407-1.524c-.773 0-1.43.68-1.43 1.524v24.773c0 .844.657 1.524 1.43 1.524c.75 0 1.407-.68 1.407-1.524\"/>",
  chevron_right: "<path fill=\"currentColor\" d=\"M18.695 48.367c.586 0 1.102-.234 1.524-.633L38.78 29.57c.446-.445.68-.984.68-1.57c0-.61-.234-1.172-.68-1.57L20.22 8.289a2.07 2.07 0 0 0-1.524-.656a2.12 2.12 0 0 0-2.156 2.156c0 .563.258 1.125.633 1.524L34.21 28L17.17 44.688c-.374.398-.632.937-.632 1.523c0 1.219.938 2.156 2.156 2.156\"/>",
  doc_text_fill: "<path fill=\"currentColor\" d=\"M15.555 53.125h24.89c4.852 0 7.266-2.461 7.266-7.336V24.508H30.742c-3 0-4.406-1.43-4.406-4.43V2.875H15.555c-4.828 0-7.266 2.484-7.266 7.36v35.554c0 4.898 2.438 7.336 7.266 7.336m15.258-31.828h16.64c-.164-.961-.844-1.899-1.945-3.047L32.57 5.102c-1.078-1.125-2.062-1.805-3.047-1.97v16.9c0 .843.446 1.265 1.29 1.265m-11.836 13.36c-.961 0-1.641-.68-1.641-1.594c0-.915.68-1.594 1.64-1.594h18.07c.938 0 1.665.68 1.665 1.593c0 .915-.727 1.594-1.664 1.594Zm0 8.929c-.961 0-1.641-.68-1.641-1.594s.68-1.594 1.64-1.594h18.07c.938 0 1.665.68 1.665 1.594s-.727 1.594-1.664 1.594Z\"/>",
  doc_chart_fill: "<path fill=\"currentColor\" d=\"M26.336 2.88v17.203c0 3 1.406 4.43 4.406 4.43h16.969v21.281c0 4.875-2.414 7.336-7.266 7.336h-24.89c-4.828 0-7.266-2.437-7.266-7.336V10.239c0-4.875 2.438-7.359 7.266-7.359zm-8.21 30.055h-1.563c-.863 0-1.563.7-1.563 1.563v10.94C15 46.3 15.7 47 16.563 47h1.563c.863 0 1.562-.7 1.562-1.563v-10.94c0-.862-.7-1.562-1.562-1.562m7.032-4.688h-1.563c-.863 0-1.562.7-1.562 1.562v15.628c0 .863.7 1.563 1.562 1.563h1.563c.863 0 1.563-.7 1.563-1.563V29.81c0-.863-.7-1.562-1.563-1.562m7.033 9.376h-1.563c-.863 0-1.563.7-1.563 1.563v6.251c0 .863.7 1.563 1.563 1.563h1.563c.863 0 1.562-.7 1.562-1.563v-6.25c0-.864-.7-1.564-1.562-1.564M29.523 3.138c.985.164 1.97.844 3.047 1.969l12.938 13.148c1.101 1.148 1.781 2.086 1.945 3.047h-16.64c-.844 0-1.29-.422-1.29-1.266Z\"/>",
  photo_fill: "<path fill=\"currentColor\" d=\"M7.715 49.574h40.57c4.899 0 7.36-2.437 7.36-7.265V13.69c0-4.828-2.461-7.265-7.36-7.265H7.715C2.84 6.426.355 8.84.355 13.69v28.62c0 4.851 2.485 7.265 7.36 7.265m10.218-21c-3.187 0-5.789-2.601-5.789-5.789c0-3.164 2.602-5.789 5.79-5.789c3.164 0 5.765 2.625 5.765 5.79c0 3.187-2.601 5.788-5.766 5.788M7.762 45.801c-2.25 0-3.633-1.36-3.633-3.657v-1.43l7.195-6.28c1.031-.914 2.156-1.383 3.211-1.383c1.125 0 2.32.469 3.352 1.43l4.5 4.03l11.18-9.937c1.171-1.031 2.46-1.5 3.773-1.5c1.289 0 2.625.492 3.75 1.524l10.78 9.984v3.61c0 2.25-1.405 3.609-3.632 3.609Z\"/>",
  film_fill: "<path fill=\"currentColor\" d=\"M6.883 49.574h42.234c4.524 0 6.774-2.226 6.774-6.68V13.107c0-4.454-2.25-6.68-6.774-6.68H6.883c-4.477 0-6.774 2.226-6.774 6.68v29.789c0 4.453 2.274 6.68 6.774 6.68m.047-3.773c-1.969 0-3.047-1.032-3.047-3.094V13.293c0-2.062 1.101-3.094 3.047-3.094h42.14c1.97 0 3.047 1.031 3.047 3.094v29.414c0 2.063-1.078 3.094-3.047 3.094Zm.094-30.164c0 .515.398.937 1.03.937h2.18c.586 0 .985-.422.985-.937V13.67c0-.633-.399-1.031-.985-1.031h-2.18c-.656 0-1.03.398-1.03 1.031Zm37.78 0c0 .515.376.937 1.008.937h2.18c.586 0 .985-.422.985-.937V13.67c0-.633-.399-1.031-.985-1.031h-2.18c-.656 0-1.008.398-1.008 1.031Zm-30.187 9.492c0 .703.445 1.125 1.149 1.125h24.492c.703 0 1.125-.422 1.125-1.125v-11.25c0-.703-.422-1.125-1.125-1.125H15.766c-.703 0-1.149.422-1.149 1.125Zm-7.594-2.813c0 .54.399.961 1.032.961h2.18c.585 0 .984-.422.984-.96v-1.97c0-.609-.399-1.007-.985-1.007h-2.18c-.656 0-1.03.398-1.03 1.008Zm37.782 0c0 .54.375.961 1.008.961h2.18c.585 0 .984-.422.984-.96v-1.97c0-.609-.399-1.007-.985-1.007h-2.18c-.656 0-1.008.398-1.008 1.008ZM7.023 29.02c0 .515.398.937 1.03.937h2.18c.586 0 .985-.422.985-.937v-1.993c0-.609-.399-1.007-.985-1.007h-2.18c-.656 0-1.03.398-1.03 1.007Zm37.78 0c0 .515.376.937 1.008.937h2.18c.586 0 .985-.422.985-.937v-1.993c0-.609-.399-1.007-.985-1.007h-2.18c-.656 0-1.008.398-1.008 1.007ZM14.617 42.098c0 .726.445 1.125 1.149 1.125h24.492c.703 0 1.125-.399 1.125-1.125v-11.18c0-.703-.422-1.102-1.125-1.102H15.766c-.703 0-1.149.399-1.149 1.102Zm-7.594-6.399c0 .516.399.961 1.032.961h2.18a.956.956 0 0 0 .984-.96v-1.97c0-.632-.399-1.03-.985-1.03h-2.18c-.656 0-1.03.398-1.03 1.03Zm37.782 0c0 .516.375.961 1.008.961h2.18a.956.956 0 0 0 .984-.96v-1.97c0-.632-.399-1.03-.985-1.03h-2.18c-.656 0-1.008.398-1.008 1.03ZM7.023 42.38c0 .539.398.96 1.03.96h2.18c.586 0 .985-.421.985-.96v-1.992c0-.586-.399-.985-.985-.985h-2.18c-.656 0-1.03.399-1.03.985Zm37.78 0c0 .539.376.96 1.008.96h2.18c.586 0 .985-.421.985-.96v-1.992c0-.586-.399-.985-.985-.985h-2.18c-.656 0-1.008.399-1.008.985Z\"/>",
  arrow_uturn_left: "<path fill=\"currentColor\" d=\"M50.148 34.914c0-8.953-6.046-15.14-16.757-15.14H17.664l-5.508.257l4.454-3.797l6.75-6.609c.374-.375.562-.82.562-1.43c0-1.218-.82-2.062-2.062-2.062c-.516 0-1.126.258-1.524.656L6.555 20.312c-.469.446-.703.985-.703 1.57c0 .563.234 1.102.703 1.548l13.781 13.523a2.2 2.2 0 0 0 1.524.656c1.242 0 2.062-.843 2.062-2.062c0-.61-.188-1.055-.562-1.43l-6.75-6.586l-4.454-3.797l5.508.235h16.078c7.992 0 12.235 4.406 12.235 10.71c0 6.329-4.243 11.016-12.235 11.016h-5.39c-1.29 0-2.133.938-2.133 2.086c0 1.149.844 2.086 2.133 2.086h5.414c10.5 0 16.382-5.976 16.382-14.953\"/>",
  checkmark: "<path fill=\"currentColor\" d=\"M23.078 48.027c1.008 0 1.805-.445 2.367-1.312L47.594 11.84c.422-.68.61-1.195.61-1.735c0-1.289-.868-2.132-2.157-2.132c-.914 0-1.453.304-2.016 1.195L22.984 42.707L12.062 28.41c-.585-.82-1.148-1.148-2.015-1.148c-1.313 0-2.25.914-2.25 2.203c0 .539.234 1.148.68 1.71L20.64 46.669c.726.914 1.43 1.36 2.437 1.36\"/>",
  cursor_rays: "<path fill=\"currentColor\" d=\"M30.04 4.797c0-1.102-.938-2.04-2.04-2.04s-2.039.938-2.039 2.04v6.844c0 1.101.938 2.039 2.04 2.039c1.1 0 2.038-.938 2.038-2.04Zm-15.376 12.96c.774.798 2.086.798 2.883 0c.773-.773.773-2.085 0-2.882l-4.805-4.828c-.773-.774-2.086-.797-2.883-.024c-.773.774-.773 2.086 0 2.883Zm23.531-2.648c-.773.797-.773 2.11 0 2.883c.797.797 2.11.797 2.907 0l4.828-4.828a2.066 2.066 0 0 0 0-2.906c-.774-.774-2.086-.774-2.883 0ZM40 50.852l-4.64-10.829l5.953.329c.96.046 1.43-.985.75-1.688L27.766 24.062c-.633-.656-1.57-.304-1.617.633l-.258 20.297c-.024 1.008 1.101 1.43 1.758.68l3.82-4.219l4.476 11.086c.235.492.703.703 1.149.54l2.508-1.032c.445-.164.632-.703.398-1.195M4.61 26.148c-1.102 0-2.04.938-2.04 2.04c0 1.101.938 2.039 2.04 2.039h6.867c1.101 0 2.039-.938 2.039-2.04c0-1.101-.938-2.039-2.04-2.039Zm46.78 4.079c1.102 0 2.04-.938 2.04-2.04c0-1.101-.938-2.039-2.04-2.039h-6.843c-1.102 0-2.04.938-2.04 2.04c0 1.101.938 2.039 2.04 2.039ZM10.07 43.21c-.796.773-.796 2.11-.023 2.883s2.11.797 2.906.023l4.828-4.828c.774-.773.774-2.086 0-2.883c-.75-.773-2.086-.773-2.882 0Z\"/>",
  hand_draw: "<path fill=\"currentColor\" d=\"M2.195 36.895c.82-.024 1.407-.657 1.43-1.5c.258-10.196 5.508-17.743 13.477-20.696l5.46 15c.047.117.024.211-.093.258c-.094.047-.164 0-.235-.07l-2.765-3c-1.805-1.946-4.102-2.086-5.883-.586c-2.016 1.71-2.04 4.265-.07 6.68l7.851 9.492c5.93 7.172 12.89 9.398 20.672 6.562c9.305-3.375 13.266-11.906 9.515-22.219l-1.757-4.804c-1.828-5.086-5.32-7.172-9.422-5.742c-1.102-1.43-2.79-1.922-4.617-1.266a7.1 7.1 0 0 0-1.828 1.031c-1.196-1.547-3.047-2.11-4.97-1.43a6.5 6.5 0 0 0-1.476.797L24.812 8.09c-1.007-2.79-3.539-3.961-6.14-3.024c-2.625.961-3.797 3.47-2.79 6.258l.188.516C7 15.238.695 23.98.695 35.348c0 .843.703 1.57 1.5 1.547m38.836 9.07c-6.14 2.25-11.906 1.101-17.32-5.438l-7.852-9.445c-.843-.984-.843-1.945-.093-2.602c.703-.632 1.664-.421 2.437.375l5.414 5.602c.914.938 1.711 1.031 2.485.75c.914-.328 1.312-1.312.937-2.32l-8.297-22.828c-.351-.938.07-1.828.961-2.157c.914-.328 1.758.118 2.11 1.055l5.93 16.29c.28.773 1.148 1.124 1.921.843c.75-.281 1.148-1.102.867-1.852l-2.133-5.882c.329-.305.774-.61 1.22-.774c1.1-.398 2.015.094 2.437 1.242l1.875 5.133c.28.797 1.148 1.102 1.898.82c.727-.258 1.195-1.03.89-1.851l-1.523-4.149a3.55 3.55 0 0 1 1.219-.797c1.102-.398 2.016.094 2.438 1.243l1.242 3.422c.304.82 1.172 1.125 1.922.843a1.446 1.446 0 0 0 .89-1.851l-.937-2.532c1.968-.703 3.82.891 5.085 4.407l1.477 4.008c3.211 8.859.281 15.609-7.5 18.445\"/>",
} as const;

type IconName = keyof typeof ICON;
function Icon({ name, size = 16 }: { name: IconName; size?: number }) {
  return <svg viewBox="0 0 56 56" width={size} height={size} aria-hidden="true" className="pointer-events-none" dangerouslySetInnerHTML={{ __html: ICON[name] }} />;
}

export type FileKind = "pdf" | "sheet" | "image" | "video" | "folder";
export type FileItem = { id: string; name: string; kind: FileKind; tags?: string[]; favourite?: boolean; pinned?: boolean; count?: number };
export type MenuAction = "rename" | "duplicate" | "link" | "move" | "pin" | "favourite" | "tag" | "trash";

const KIND: Record<FileKind, { icon: IconName; tint: string }> = {
  pdf: { icon: "doc_text_fill", tint: "#ff3b30" },
  sheet: { icon: "doc_chart_fill", tint: "#30b350" },
  image: { icon: "photo_fill", tint: "#0a84ff" },
  video: { icon: "film_fill", tint: "#bf5af2" },
  folder: { icon: "folder_fill", tint: "#3ea6ff" },
};

const TAGS = [
  { name: "Red", hex: "#ff3b30" },
  { name: "Orange", hex: "#ff9f0a" },
  { name: "Yellow", hex: "#ffcc00" },
  { name: "Green", hex: "#30d158" },
  { name: "Blue", hex: "#0a84ff" },
  { name: "Purple", hex: "#bf5af2" },
];

const DEMO: FileItem[] = [
  { id: "f1", name: "Brand Guide.pdf", kind: "pdf", tags: ["Red"] },
  { id: "f2", name: "Assets", kind: "folder", count: 12 },
  { id: "f3", name: "Budget.numbers", kind: "sheet", tags: ["Green"] },
  { id: "f4", name: "Hero Shot.jpg", kind: "image", favourite: true },
  { id: "f5", name: "Teaser.mov", kind: "video", tags: ["Purple", "Blue"] },
  { id: "f6", name: "Archive", kind: "folder", count: 48 },
];

const SPRING = { type: "spring", stiffness: 520, damping: 32 } as const;
const FLOW = { type: "spring", stiffness: 380, damping: 34 } as const;
const OPEN = { type: "spring", stiffness: 560, damping: 29, mass: 0.85 } as const;
const CLOSE = { type: "spring", stiffness: 760, damping: 46 } as const;
const GLIDE = { type: "spring", stiffness: 700, damping: 44 } as const;

// menu geometry
const W = 236;
const SW = 184;
const ROW = 30;
const SEP = 9;
const TAGROW = 32;
const PAD = 6;
const GAP = 12;

type Row = { key: string; label: string; icon: IconName; hint?: string; danger?: boolean; sub?: boolean } | "sep" | "tags";

function rowsFor(f: FileItem): Row[] {
  return [
    { key: "rename", label: "Rename", icon: "pencil", hint: "↩" },
    { key: "duplicate", label: "Duplicate", icon: "doc_on_doc", hint: "⌘D" },
    { key: "link", label: "Copy Link", icon: "link" },
    "sep",
    { key: "move", label: "Move To", icon: "folder", sub: true },
    { key: "pin", label: f.pinned ? "Unpin" : "Pin to Top", icon: f.pinned ? "pin_fill" : "pin" },
    { key: "favourite", label: f.favourite ? "Remove from Favourites" : "Add to Favourites", icon: f.favourite ? "star_fill" : "star" },
    "sep",
    "tags",
    "sep",
    { key: "trash", label: "Move to Trash", icon: "trash", hint: "⌘⌫", danger: true },
  ];
}
const ORDER = ["rename", "duplicate", "link", "move", "pin", "favourite", "tags", "trash"];
const rowH = (r: Row) => (r === "sep" ? SEP : r === "tags" ? TAGROW : ROW);
const MENU_H = PAD * 2 + rowsFor(DEMO[0]).reduce((a, r) => a + rowH(r), 0);
const MOVE_TOP = PAD + rowsFor(DEMO[0]).slice(0, 4).reduce((a, r) => a + rowH(r), 0);

const copyName = (name: string, taken: Set<string>) => {
  const dot = name.lastIndexOf(".");
  const base = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot) : "";
  let n = `${base} copy${ext}`;
  for (let i = 2; taken.has(n); i++) n = `${base} copy ${i}${ext}`;
  return n;
};

/** one file in the grid: tinted icon, name, tags, and the little badges */
const Tile = forwardRef<
  HTMLDivElement,
  {
    file: FileItem;
    selected: boolean;
    pressing: boolean;
    renaming: boolean;
    pulse: number;
    tabbable: boolean;
    onRename: (name: string | null) => void;
    handlers: {
      onPointerDown: (e: RPointerEvent<HTMLDivElement>) => void;
      onPointerMove: (e: RPointerEvent<HTMLDivElement>) => void;
      onPointerUp: () => void;
      onContextMenu: (e: RMouseEvent<HTMLDivElement>) => void;
      onFocus: () => void;
    };
  }
>(function Tile({
  file,
  selected,
  pressing,
  renaming,
  pulse,
  tabbable,
  onRename,
  handlers,
}, ref) {
  const k = KIND[file.kind];
  const icon = useAnimationControls();
  useEffect(() => {
    if (pulse) void icon.start({ scale: [1, 1.2, 0.94, 1], transition: { duration: 0.5, times: [0, 0.3, 0.65, 1] } });
  }, [pulse, icon]);
  const tags = TAGS.filter((t) => file.tags?.includes(t.name));
  return (
    <motion.div
      ref={ref}
      layout
      data-file={file.id}
      role="option"
      aria-selected={selected}
      aria-label={`${file.name}${file.kind === "folder" ? `, folder, ${file.count ?? 0} items` : ""}`}
      tabIndex={tabbable ? 0 : -1}
      {...handlers}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: pressing ? 0.92 : 1 }}
      exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.18 } }}
      transition={{ layout: FLOW, default: pressing ? { type: "spring", stiffness: 120, damping: 20 } : SPRING }}
      className="group relative flex w-[100px] cursor-default touch-manipulation select-none flex-col items-center rounded-[14px] px-1 pb-1.5 pt-2 outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3]"
      style={{ WebkitTouchCallout: "none" }}
    >
      <motion.div
        data-icon
        animate={icon}
        className="relative flex h-[60px] w-[60px] items-center justify-center rounded-[16px] transition-shadow duration-150"
        style={{
          background: `color-mix(in srgb, ${k.tint} 13%, white)`,
          color: k.tint,
          boxShadow: selected ? "0 0 0 4px #e8e8ed" : "0 0 0 0 transparent",
        }}
      >
        <Icon name={k.icon} size={30} />
        <AnimatePresence>
          {file.favourite && (
            <motion.span
              key="fav"
              initial={{ scale: 0, rotate: -50 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 40 }}
              transition={{ type: "spring", stiffness: 600, damping: 15 }}
              className="absolute -right-1.5 -top-1.5 flex h-[22px] w-[22px] items-center justify-center rounded-full bg-white text-[#ff9f0a] shadow-[0_1px_4px_rgba(0,0,0,.18)]"
            >
              <Icon name="star_fill" size={13} />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
      <div className="mt-2 flex max-w-full items-center justify-center gap-1">
        <AnimatePresence initial={false}>
          {file.pinned && (
            <motion.span key="pin" initial={{ width: 0, opacity: 0 }} animate={{ width: 11, opacity: 1 }} exit={{ width: 0, opacity: 0 }} className="flex shrink-0 justify-center text-[#86868b]">
              <Icon name="pin_fill" size={11} />
            </motion.span>
          )}
        </AnimatePresence>
        {renaming ? (
          <input
            aria-label="New name"
            defaultValue={file.name}
            autoFocus
            onFocus={(e) => {
              const dot = file.name.lastIndexOf(".");
              e.currentTarget.setSelectionRange(0, dot > 0 ? dot : file.name.length);
            }}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === "Enter") onRename(e.currentTarget.value);
              if (e.key === "Escape") onRename(null);
            }}
            onBlur={(e) => onRename(e.currentTarget.value)}
            className="w-[96px] rounded-[5px] border-0 bg-white px-1 py-[1px] text-center text-[12.5px] text-[#1d1d1f] outline-none ring-2 ring-[#0071e3]"
          />
        ) : (
          <span
            className="line-clamp-2 break-words rounded-[5px] px-1.5 py-[1px] text-center text-[12.5px] leading-[1.25] transition-colors duration-150"
            style={{ background: selected ? "#0071e3" : "transparent", color: selected ? "#fff" : "#1d1d1f" }}
          >
            {/* a single long word wraps before its extension rather than mid-word */}
            {file.name.lastIndexOf(".") > 0 && !file.name.includes(" ") ? (
              <>
                {file.name.slice(0, file.name.lastIndexOf("."))}
                <wbr />
                {file.name.slice(file.name.lastIndexOf("."))}
              </>
            ) : (
              file.name
            )}
          </span>
        )}
      </div>
      <div className="mt-1 flex h-[8px] items-center justify-center">
        <AnimatePresence initial={false}>
          {tags.map((t, i) => (
            <motion.span
              layout
              key={t.name}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 700, damping: 22 }}
              className="block h-[8px] w-[8px] rounded-full ring-[1.5px] ring-white"
              style={{ background: t.hex, marginLeft: i ? -2 : 0 }}
            />
          ))}
        </AnimatePresence>
        {file.kind === "folder" && !tags.length && <span className="text-[11px] leading-none text-[#86868b]">{file.count ?? 0} items</span>}
      </div>
    </motion.div>
  );
});

type MenuState = { n: number; id: string; px: number; py: number; via: "pointer" | "keyboard" | "auto"; at: number };
type Toast = { n: number; text: string; undo?: () => void };
type Ghost = { file: FileItem; folder: string; from: { x: number; y: number }; to?: { x: number; y: number } };

/**
 * Context Menu: the right-click menu, made out of liquid. Right-click a file
 * (or press and hold on a phone, or Shift+F10) and a drop forms under your
 * pointer, then flows out into the menu while the drop is absorbed. The
 * highlight glides from row to row; "Move To" buds a submenu off the side
 * that snaps free like a droplet. Every action is real: rename in place,
 * duplicate, copy a link, pin to the top, favourite, tag, move into a folder
 * (the file flies in and the folder bounces) or move to Trash with Undo.
 * On close, the menu drains back into the point it came from. Arrow keys,
 * Enter, Escape and the usual Finder shortcuts work throughout.
 */
export function ContextMenu({
  files: initial = DEMO,
  title = "Q4 Launch",
  autoplay = false,
  onAction,
  onChange,
  className = "",
}: {
  files?: FileItem[];
  title?: string;
  /** play a few right-clicks by itself until the first interaction */
  autoplay?: boolean;
  /** fires for every action, after the grid has updated */
  onAction?: (action: MenuAction, file: FileItem, detail?: string) => void;
  onChange?: (files: FileItem[]) => void;
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const root = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  const inView = useInView(root, { amount: 0.35 });
  const touched = useRef(false);

  const [files, setFilesState] = useState<FileItem[]>(initial);
  const filesRef = useRef(files);
  const setFiles = useCallback(
    (next: FileItem[] | ((f: FileItem[]) => FileItem[])) => {
      const v = typeof next === "function" ? next(filesRef.current) : next;
      filesRef.current = v;
      setFilesState(v);
      onChange?.(v);
    },
    [onChange],
  );

  const [selected, setSelected] = useState<string | null>(null);
  const [menu, setMenu] = useState<MenuState | null>(null);
  const menuRef = useRef(menu);
  const [active, setActive] = useState<string | null>(null);
  const [tagIdx, setTagIdx] = useState(0);
  const [sub, setSub] = useState(false);
  const [subActive, setSubActive] = useState<string | null>(null);
  const [renaming, setRenamingState] = useState<string | null>(null);
  const renamingRef = useRef<string | null>(null);
  const setRenaming = (id: string | null) => {
    renamingRef.current = id;
    setRenamingState(id);
  };
  const [pressing, setPressing] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const toastRef = useRef(toast);
  const [ghost, setGhost] = useState<Ghost | null>(null);
  const [pulse, setPulse] = useState<{ id: string; n: number }>({ id: "", n: 0 });
  const [size, setSize] = useState({ w: 560, h: 330 });
  const [touchUI, setTouchUI] = useState(false);
  const kb = useRef(false);
  const subTimer = useRef(0);
  const counter = useRef(0);

  // handlers and timers read these; keep them current as soon as the layout commits
  useLayoutEffect(() => {
    filesRef.current = files;
    menuRef.current = menu;
    toastRef.current = toast;
  });
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the pointer type is only known in the browser, after mount
    setTouchUI(window.matchMedia?.("(hover: none)").matches ?? false);
  }, []);
  useLayoutEffect(() => {
    const el = body.current;
    if (!el) return;
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const file = menu ? files.find((f) => f.id === menu.id) ?? null : null;
  const folders = useMemo(() => files.filter((f) => f.kind === "folder" && f.id !== menu?.id), [files, menu?.id]);

  /* ------------------------------------------------------------ geometry */
  const geo = useMemo(() => {
    if (!menu) return null;
    const { w, h } = size;
    let mx = menu.px + 4;
    if (mx + W > w - 8) mx = menu.px - 4 - W;
    mx = Math.max(8, Math.min(mx, w - W - 8));
    let my = menu.py + 4;
    if (my + MENU_H > h - 8) my = menu.py - 4 - MENU_H;
    my = Math.max(8, Math.min(my, h - MENU_H - 8));
    const subH = PAD * 2 + Math.max(1, folders.length) * ROW;
    let side: "right" | "left" | "over" = "right";
    let sx = mx + W + GAP;
    if (sx + SW > w - 8) {
      side = "left";
      sx = mx - GAP - SW;
      if (sx < 8) {
        side = "over";
        sx = Math.min(mx + 28, w - SW - 8);
      }
    }
    let sy = side === "over" ? my + MOVE_TOP + ROW - 4 : my + MOVE_TOP - PAD;
    sy = Math.max(8, Math.min(sy, h - subH - 8));
    const anchor = my + MOVE_TOP + ROW / 2 - sy;
    return { mx, my, ox: menu.px - mx, oy: menu.py - my, sx, sy, subH, side, anchor };
  }, [menu, size, folders.length]);

  /* ------------------------------------------------------------- actions */
  const show = (text: string, undo?: () => void) => setToast({ n: ++counter.current, text, undo });
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast((c) => (c?.n === toast.n ? null : c)), 3400);
    return () => window.clearTimeout(t);
  }, [toast]);

  const focusTile = (id: string) => window.setTimeout(() => body.current?.querySelector<HTMLElement>(`[data-file="${id}"]`)?.focus({ preventScroll: true }), 0);

  const close = useCallback((refocus = true) => {
    const m = menuRef.current;
    window.clearTimeout(subTimer.current);
    setMenu(null);
    setSub(false);
    setActive(null);
    setSubActive(null);
    if (m && refocus && m.via !== "auto") focusTile(m.id);
  }, []);

  const openAt = useCallback((id: string, px: number, py: number, via: MenuState["via"]) => {
    window.clearTimeout(subTimer.current);
    setSelected(id);
    setRenaming(null);
    setSub(false);
    setSubActive(null);
    setTagIdx(0);
    setActive(via === "keyboard" ? "rename" : null);
    kb.current = via === "keyboard";
    setMenu({ n: ++counter.current, id, px, py, via, at: performance.now() });
  }, []);

  const tileCenter = (id: string, dx = 0, dy = 0) => {
    const b = body.current?.getBoundingClientRect();
    const t = body.current?.querySelector<HTMLElement>(`[data-file="${id}"] [data-icon]`)?.getBoundingClientRect();
    if (!b || !t) return { x: 60, y: 60 };
    return { x: t.left - b.left + t.width / 2 + dx, y: t.top - b.top + t.height / 2 + dy };
  };

  const act = useCallback(
    (key: string, f: FileItem, detail?: string) => {
      const list = filesRef.current;
      const idx = list.findIndex((x) => x.id === f.id);
      switch (key) {
        case "rename":
          close(false);
          setRenaming(f.id);
          return;
        case "duplicate": {
          const copy: FileItem = { ...f, id: `${f.id}-${++counter.current}`, name: copyName(f.name, new Set(list.map((x) => x.name))), pinned: false };
          setFiles([...list.slice(0, idx + 1), copy, ...list.slice(idx + 1)]);
          setSelected(copy.id);
          close(false);
          if (menuRef.current?.via !== "auto") focusTile(copy.id);
          onAction?.("duplicate", f, copy.id);
          return;
        }
        case "link": {
          const url = `https://files.example.com/${encodeURIComponent(f.name.toLowerCase().replace(/\s+/g, "-"))}`;
          if (menuRef.current?.via !== "auto") navigator.clipboard?.writeText(url).catch(() => {});
          show("Link copied");
          close();
          onAction?.("link", f, url);
          return;
        }
        case "pin": {
          const next = { ...f, pinned: !f.pinned };
          const rest = list.filter((x) => x.id !== f.id);
          setFiles(next.pinned ? [next, ...rest] : list.map((x) => (x.id === f.id ? next : x)));
          close();
          onAction?.("pin", next);
          return;
        }
        case "favourite": {
          const next = { ...f, favourite: !f.favourite };
          setFiles(list.map((x) => (x.id === f.id ? next : x)));
          close();
          onAction?.("favourite", next);
          return;
        }
        case "tag": {
          const has = f.tags?.includes(detail!);
          const next = { ...f, tags: has ? f.tags!.filter((t) => t !== detail) : [...(f.tags ?? []), detail!] };
          setFiles(list.map((x) => (x.id === f.id ? next : x)));
          onAction?.("tag", next, detail);
          return;
        }
        case "trash": {
          setFiles(list.filter((x) => x.id !== f.id));
          setSelected(null);
          close(false);
          show(`Moved “${f.name}” to Trash`, () => {
            const cur = filesRef.current;
            setFiles([...cur.slice(0, idx), f, ...cur.slice(idx)]);
            setSelected(f.id);
          });
          onAction?.("trash", f);
          return;
        }
        case "move": {
          const folder = list.find((x) => x.id === detail);
          if (!folder || !body.current) return;
          const b = body.current.getBoundingClientRect();
          const s = body.current.querySelector<HTMLElement>(`[data-file="${f.id}"] [data-icon]`)?.getBoundingClientRect();
          setGhost({ file: f, folder: folder.id, from: s ? { x: s.left - b.left, y: s.top - b.top } : { x: 0, y: 0 } });
          setFiles(list.filter((x) => x.id !== f.id));
          setSelected(null);
          close(false);
          show(`Moved to ${folder.name}`, () => {
            const cur = filesRef.current;
            setFiles([...cur.slice(0, idx), f, ...cur.slice(idx)].map((x) => (x.id === folder.id ? { ...x, count: Math.max(0, (x.count ?? 1) - 1) } : x)));
            setSelected(f.id);
          });
          onAction?.("move", f, folder.id);
          return;
        }
      }
    },
    [close, setFiles, onAction],
  );

  // the flying file aims at where the folder will be once the grid has reflowed
  useLayoutEffect(() => {
    if (!ghost || ghost.to || !body.current) return;
    const tile = body.current.querySelector<HTMLElement>(`[data-file="${ghost.folder}"]`);
    const icon = tile?.querySelector<HTMLElement>("[data-icon]");
    if (!tile || !icon) return setGhost(null);
    setGhost({ ...ghost, to: { x: tile.offsetLeft + icon.offsetLeft, y: tile.offsetTop + icon.offsetTop } });
  }, [ghost]);
  const land = () => {
    if (!ghost) return;
    setFiles((list) => list.map((x) => (x.id === ghost.folder ? { ...x, count: (x.count ?? 0) + 1 } : x)));
    setPulse((p) => ({ id: ghost.folder, n: p.n + 1 }));
    setGhost(null);
  };

  const pick = (key: string) => {
    if (!file) return;
    if (key === "move") {
      setSub(true);
      setActive("move");
      if (kb.current) setSubActive(folders[0]?.id ?? null);
      return;
    }
    act(key, file);
  };

  /* ------------------------------------------------------- pointer + keys */
  const press = useRef<{ id: string; x: number; y: number; t: number; fired: boolean } | null>(null);
  const local = (clientX: number, clientY: number) => {
    const b = body.current!.getBoundingClientRect();
    return { x: clientX - b.left, y: clientY - b.top };
  };
  const tileHandlers = (f: FileItem) => ({
    onPointerDown: (e: RPointerEvent<HTMLDivElement>) => {
      touched.current = true;
      if (e.button === 2) return;
      setSelected(f.id);
      if (e.pointerType !== "mouse") {
        const p = local(e.clientX, e.clientY);
        setPressing(f.id);
        const t = window.setTimeout(() => {
          if (press.current) press.current.fired = true;
          setPressing(null);
          openAt(f.id, p.x, p.y, "pointer");
        }, 450);
        press.current = { id: f.id, x: e.clientX, y: e.clientY, t, fired: false };
      }
    },
    onPointerMove: (e: RPointerEvent<HTMLDivElement>) => {
      const p = press.current;
      if (p && !p.fired && Math.hypot(e.clientX - p.x, e.clientY - p.y) > 8) {
        window.clearTimeout(p.t);
        press.current = null;
        setPressing(null);
      }
    },
    onPointerUp: () => {
      const p = press.current;
      if (p) window.clearTimeout(p.t);
      press.current = null;
      setPressing(null);
    },
    onContextMenu: (e: RMouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      touched.current = true;
      const m = menuRef.current;
      if (m && m.id === f.id && performance.now() - m.at < 700) return; // the long press already opened it
      const p = local(e.clientX, e.clientY);
      openAt(f.id, p.x, p.y, "pointer");
    },
    onFocus: () => setSelected(f.id),
  });

  const gridKey = (e: KeyboardEvent<HTMLDivElement>) => {
    touched.current = true;
    if (renaming || menu) return;
    const list = filesRef.current;
    const i = list.findIndex((f) => f.id === selected);
    const f = list[i];
    const mod = e.metaKey || e.ctrlKey;
    if ((e.shiftKey && e.key === "F10") || e.key === "ContextMenu") {
      if (!f) return;
      e.preventDefault();
      const c = tileCenter(f.id, 6, 6);
      openAt(f.id, c.x, c.y, "keyboard");
      return;
    }
    if (f && e.key === "Enter") {
      e.preventDefault();
      setRenaming(f.id);
      return;
    }
    if (f && mod && e.key.toLowerCase() === "d") {
      e.preventDefault();
      act("duplicate", f);
      return;
    }
    if (f && mod && (e.key === "Backspace" || e.key === "Delete")) {
      e.preventDefault();
      act("trash", f);
      return;
    }
    const tiles = Array.from(body.current?.querySelectorAll<HTMLElement>("[data-file]") ?? []);
    const cols = Math.max(1, tiles.filter((t) => t.offsetTop === tiles[0]?.offsetTop).length);
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : e.key === "ArrowDown" ? cols : e.key === "ArrowUp" ? -cols : 0;
    if (!step) return;
    e.preventDefault();
    const next = list[Math.max(0, Math.min(list.length - 1, (i < 0 ? 0 : i + step)))];
    if (next) {
      setSelected(next.id);
      focusTile(next.id);
    }
  };

  const menuKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!file) return;
    touched.current = true;
    kb.current = true;
    const k = e.key;
    if (k === "Tab") {
      e.preventDefault();
      close();
      return;
    }
    if (k === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      if (sub) {
        setSub(false);
        setSubActive(null);
        setActive("move");
      } else close();
      return;
    }
    if (sub && subActive) {
      const ids = folders.map((f) => f.id);
      const j = ids.indexOf(subActive);
      if (k === "ArrowDown" || k === "ArrowUp") {
        e.preventDefault();
        setSubActive(ids[(j + (k === "ArrowDown" ? 1 : -1) + ids.length) % ids.length]);
      } else if (k === "ArrowLeft") {
        e.preventDefault();
        setSub(false);
        setSubActive(null);
      } else if (k === "Enter" || k === " ") {
        e.preventDefault();
        act("move", file, subActive);
      }
      return;
    }
    const i = active ? ORDER.indexOf(active) : -1;
    if (k === "ArrowDown" || k === "ArrowUp") {
      e.preventDefault();
      const d = k === "ArrowDown" ? 1 : -1;
      setActive(ORDER[(i + d + ORDER.length) % ORDER.length] ?? ORDER[0]);
      setSub(false);
    } else if (k === "ArrowRight") {
      e.preventDefault();
      if (active === "move") pick("move");
      if (active === "tags") setTagIdx((t) => Math.min(TAGS.length - 1, t + 1));
    } else if (k === "ArrowLeft") {
      e.preventDefault();
      if (active === "tags") setTagIdx((t) => Math.max(0, t - 1));
    } else if (k === "Enter" || k === " ") {
      e.preventDefault();
      if (active === "tags") act("tag", file, TAGS[tagIdx].name);
      else if (active) pick(active);
    }
  };

  // keep keyboard focus on the highlighted row
  useEffect(() => {
    if (!menu || menu.via === "auto" || !kb.current) return;
    const sel = sub && subActive ? `[data-sub="${subActive}"]` : active === "tags" ? `[data-tag="${tagIdx}"]` : active ? `[data-key="${active}"]` : null;
    const el = sel ? layer.current?.querySelector<HTMLElement>(sel) : layer.current?.querySelector<HTMLElement>("[role=menu]");
    el?.focus({ preventScroll: true });
  }, [menu, active, sub, subActive, tagIdx]);
  useEffect(() => {
    if (!menu || menu.via === "auto") return;
    const t = window.setTimeout(() => {
      if (!kb.current) layer.current?.querySelector<HTMLElement>("[role=menu]")?.focus({ preventScroll: true });
    }, 0);
    return () => window.clearTimeout(t);
  }, [menu]);

  // click anywhere else, scroll or resize: the menu drains away
  useEffect(() => {
    if (!menu) return;
    const down = (e: PointerEvent) => {
      if (layer.current?.contains(e.target as Node)) return;
      close(false);
    };
    const away = () => close(false);
    document.addEventListener("pointerdown", down, true);
    window.addEventListener("resize", away);
    window.addEventListener("scroll", away, true);
    return () => {
      document.removeEventListener("pointerdown", down, true);
      window.removeEventListener("resize", away);
      window.removeEventListener("scroll", away, true);
    };
  }, [menu, close]);

  const hover = (key: string) => {
    kb.current = false;
    setActive(key);
    window.clearTimeout(subTimer.current);
    if (key === "move") subTimer.current = window.setTimeout(() => setSub(true), 140);
    else if (sub)
      subTimer.current = window.setTimeout(() => {
        setSub(false);
        setSubActive(null);
      }, 220);
  };

  /* ------------------------------------------------------------ autoplay */
  useEffect(() => {
    if (!autoplay || !inView) return;
    let alive = true;
    const ok = () => alive && !touched.current;
    const wait = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));
    const glide = async (keys: string[], gap = 230) => {
      for (const k of keys) {
        if (!ok()) return;
        setActive(k);
        await wait(gap);
      }
    };
    const fileOf = (id: string) => filesRef.current.find((f) => f.id === id);
    (async () => {
      await wait(900);
      while (ok()) {
        // favourite
        let c = tileCenter("f1", 10, 12);
        openAt("f1", c.x, c.y, "auto");
        await wait(650);
        await glide(["rename", "duplicate", "link", "move"]);
        if (!ok()) return;
        setSub(true);
        await wait(520);
        setSubActive("f2");
        await wait(380);
        setSubActive(null);
        setSub(false);
        await glide(["pin", "favourite"], 300);
        if (!ok()) return;
        const f1 = fileOf("f1");
        if (f1) act("favourite", f1);
        await wait(1500);
        if (!ok()) return;

        // move into a folder
        c = tileCenter("f5", 12, 10);
        openAt("f5", c.x, c.y, "auto");
        await wait(600);
        await glide(["duplicate", "link", "move"], 210);
        if (!ok()) return;
        setSub(true);
        await wait(500);
        setSubActive("f6");
        await wait(320);
        setSubActive("f2");
        await wait(420);
        if (!ok()) return;
        const f5 = fileOf("f5");
        if (f5) act("move", f5, "f2");
        await wait(2000);
        if (!ok()) return;

        // trash, then undo
        c = tileCenter("f3", 8, 14);
        openAt("f3", c.x, c.y, "auto");
        await wait(600);
        await glide(["duplicate", "link", "move", "pin", "favourite", "tags"], 170);
        if (!ok()) return;
        for (const t of [1, 2, 3]) {
          setTagIdx(t);
          await wait(140);
        }
        await glide(["trash"], 420);
        if (!ok()) return;
        const f3 = fileOf("f3");
        if (f3) act("trash", f3);
        await wait(1500);
        if (!ok()) return;
        toastRef.current?.undo?.();
        setToast(null);
        await wait(1700);
        if (!ok()) return;
        setSelected(null);
        setFiles(initial);
        await wait(1400);
      }
    })();
    return () => {
      alive = false;
    };
    // a fixed script
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoplay, inView]);

  /* --------------------------------------------------------------- render */
  const rows = file ? rowsFor(file) : [];
  const tabStop = selected && files.some((f) => f.id === selected) ? selected : files[0]?.id;
  const subSide = geo?.side ?? "right";
  const budX = subSide === "right" ? -22 : subSide === "left" ? 22 : 0;

  const panel = (kind: "menu" | "sub", content: boolean) => {
    if (!geo) return null;
    const isMenu = kind === "menu";
    return {
      className: `absolute ${content ? "" : "bg-white"} rounded-[13px]`,
      style: isMenu
        ? { left: geo.mx, top: geo.my, width: W, height: MENU_H, transformOrigin: `${geo.ox}px ${geo.oy}px` }
        : {
            left: geo.sx,
            top: geo.sy,
            width: SW,
            height: geo.subH,
            transformOrigin: subSide === "right" ? `0px ${geo.anchor}px` : subSide === "left" ? `${SW}px ${geo.anchor}px` : `40px 0px`,
          },
      initial: isMenu ? { scale: 0.1 } : { scale: 0.3, x: budX, opacity: 1 },
      animate: isMenu ? { scale: 1, transition: OPEN } : { scale: 1, x: 0, opacity: 1, transition: OPEN },
      exit: isMenu ? { scale: 0.06, transition: CLOSE } : { scale: 0.3, x: budX, opacity: 0, transition: CLOSE },
    };
  };
  const fade = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { delay: 0.05, duration: 0.16 } },
    exit: { opacity: 0, transition: { duration: 0.07 } },
  };

  return (
    <div ref={root} className={`w-full max-w-[600px] overflow-hidden rounded-[26px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,.05),0_20px_40px_-26px_rgba(0,0,0,.35)] ${className}`} onPointerDown={() => (touched.current = true)}>
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <defs>
          <filter id={`${uid}-goo`} x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="b" />
            <feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9" result="g" />
            <feComposite in="SourceGraphic" in2="g" operator="atop" />
          </filter>
        </defs>
      </svg>

      <div className="flex items-center justify-between gap-3 border-b border-black/[.06] px-5 py-3.5">
        <div className="flex shrink-0 items-baseline gap-2">
          <h3 className="m-0 text-[15px] font-semibold tracking-[-0.01em] text-[#1d1d1f]">{title}</h3>
          <span className="shrink-0 text-[13px] tabular-nums text-[#86868b]">{files.length} items</span>
        </div>
        <span className="flex min-w-0 items-center gap-1.5 rounded-full bg-[#f5f5f7] px-2.5 py-1 text-[12px] text-[#6e6e73]">
          <span className="flex shrink-0">
            <Icon name={touchUI ? "hand_draw" : "cursor_rays"} size={13} />
          </span>
          <span className="truncate">{touchUI ? "Press and hold a file" : "Right-click a file"}</span>
        </span>
      </div>

      <div
        ref={body}
        className="relative min-h-[340px] p-3.5"
        onPointerDown={(e) => {
          if (!(e.target as HTMLElement).closest("[data-file], [role=menu], [role=status]")) setSelected(null);
        }}
      >
        <div role="listbox" aria-label={`${title} files. Press Shift+F10 or the Menu key for actions.`} aria-orientation="horizontal" onKeyDown={gridKey} className="flex flex-wrap content-start gap-x-1 gap-y-2">
          <AnimatePresence mode="popLayout">
            {files.map((f) => (
              <Tile
                key={f.id}
                file={f}
                selected={selected === f.id}
                pressing={pressing === f.id}
                renaming={renaming === f.id}
                pulse={pulse.id === f.id ? pulse.n : 0}
                tabbable={tabStop === f.id}
                handlers={tileHandlers(f)}
                onRename={(name) => {
                  if (renamingRef.current !== f.id) return; // Enter or Escape already settled it
                  setRenaming(null);
                  const v = name?.trim();
                  if (v && v !== f.name) {
                    setFiles(filesRef.current.map((x) => (x.id === f.id ? { ...x, name: v } : x)));
                    onAction?.("rename", { ...f, name: v }, f.name);
                  }
                  focusTile(f.id);
                }}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* the file on its way into a folder */}
        {ghost?.to && (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 z-30 flex h-[60px] w-[60px] items-center justify-center rounded-[16px] shadow-[0_10px_24px_-10px_rgba(0,0,0,.4)]"
            style={{ background: `color-mix(in srgb, ${KIND[ghost.file.kind].tint} 13%, white)`, color: KIND[ghost.file.kind].tint }}
            initial={{ x: ghost.from.x, y: ghost.from.y, scale: 1, opacity: 1 }}
            animate={{
              x: [ghost.from.x, (ghost.from.x + ghost.to.x) / 2, ghost.to.x],
              y: [ghost.from.y, Math.min(ghost.from.y, ghost.to.y) - 46, ghost.to.y],
              scale: [1, 0.86, 0.32],
              opacity: [1, 1, 0],
            }}
            transition={{ duration: 0.62, times: [0, 0.45, 1], ease: ["easeOut", "easeIn"] }}
            onAnimationComplete={land}
          >
            <Icon name={KIND[ghost.file.kind].icon} size={30} />
          </motion.div>
        )}

        {/* liquid: the drop, the menu and the submenu share one goo filter, so they flow into each other */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10" style={{ filter: `url(#${uid}-goo) drop-shadow(0 16px 26px rgba(0,0,0,.16)) drop-shadow(0 0 0.6px rgba(0,0,0,.35))` }}>
          <AnimatePresence>
            {menu && geo && (
              <motion.div key={menu.n} className="absolute inset-0" exit={{ opacity: 1, transition: { duration: 0.4 } }}>
                <motion.div
                  className="absolute rounded-full bg-white"
                  style={{ left: menu.px - 13, top: menu.py - 13, width: 26, height: 26 }}
                  initial={{ scale: 0.2 }}
                  animate={{ scale: [0.2, 1.1, 0], transition: { duration: 0.55, times: [0, 0.22, 1], ease: ["easeOut", "easeIn"] } }}
                  exit={{ scale: [0, 1, 0], transition: { duration: 0.36, times: [0, 0.45, 1] } }}
                />
                <motion.div {...panel("menu", false)!} />
                <AnimatePresence>{sub && subSide !== "over" && <motion.div key="sub" {...panel("sub", false)!} />}</AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* the readable layer on top: same shapes, same springs, no filter */}
        <div ref={layer} className="pointer-events-none absolute inset-0 z-20">
          <AnimatePresence>
            {menu && geo && file && (
              <motion.div key={menu.n} className="absolute inset-0" exit={{ opacity: 1, transition: { duration: 0.4 } }}>
                <motion.div {...panel("menu", true)!} className="pointer-events-auto absolute rounded-[13px]">
                  <motion.div
                    {...fade}
                    role="menu"
                    tabIndex={-1}
                    aria-label={`Actions for ${file.name}`}
                    onKeyDown={menuKey}
                    onPointerLeave={() => !sub && setActive(null)}
                    className="flex h-full flex-col p-[6px] outline-none"
                  >
                    {rows.map((row, i) => {
                      if (row === "sep") return <div key={`s${i}`} role="separator" className="mx-2.5 my-1 h-px shrink-0 bg-black/[.08]" />;
                      if (row === "tags")
                        return (
                          <div key="tags" role="group" aria-label="Tags" onPointerEnter={() => hover("tags")} className="flex h-[32px] shrink-0 items-center gap-[9px] px-2.5">
                            {TAGS.map((t, j) => {
                              const on = !!file.tags?.includes(t.name);
                              const focus = active === "tags" && tagIdx === j;
                              return (
                                <motion.button
                                  key={t.name}
                                  type="button"
                                  role="menuitemcheckbox"
                                  aria-checked={on}
                                  aria-label={`${t.name} tag`}
                                  data-tag={j}
                                  tabIndex={-1}
                                  onClick={() => act("tag", file, t.name)}
                                  onPointerEnter={() => setTagIdx(j)}
                                  whileHover={{ scale: 1.22 }}
                                  whileTap={{ scale: 0.9 }}
                                  animate={{ scale: focus ? 1.22 : 1 }}
                                  transition={{ type: "spring", stiffness: 600, damping: 18 }}
                                  className="relative flex h-[16px] w-[16px] cursor-pointer items-center justify-center rounded-full border-0 p-0 text-white outline-none"
                                  style={{ background: t.hex, boxShadow: on ? `0 0 0 2px #fff, 0 0 0 3.5px ${t.hex}` : "none" }}
                                >
                                  <AnimatePresence>
                                    {on && (
                                      <motion.span key="c" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="flex">
                                        <Icon name="checkmark" size={10} />
                                      </motion.span>
                                    )}
                                  </AnimatePresence>
                                </motion.button>
                              );
                            })}
                          </div>
                        );
                      const on = active === row.key;
                      return (
                        <button
                          key={row.key}
                          type="button"
                          role="menuitem"
                          data-key={row.key}
                          tabIndex={-1}
                          aria-haspopup={row.sub ? "menu" : undefined}
                          aria-expanded={row.sub ? sub : undefined}
                          onPointerEnter={() => hover(row.key)}
                          onClick={() => pick(row.key)}
                          className="relative flex h-[30px] w-full shrink-0 cursor-default items-center gap-2.5 rounded-[7px] border-0 bg-transparent px-2.5 text-left text-[13.5px] outline-none transition-colors duration-100"
                          style={{ color: on ? "#fff" : row.danger ? "#ff3b30" : "#1d1d1f" }}
                        >
                          {on && <motion.span layoutId={`${uid}-hl`} className="absolute inset-0 z-0 rounded-[7px]" style={{ background: row.danger ? "#ff3b30" : "#0071e3" }} transition={GLIDE} />}
                          <span className="relative z-[1] flex opacity-90">
                            <Icon name={row.icon} size={15} />
                          </span>
                          <span className="relative z-[1] min-w-0 flex-1 truncate">{row.label}</span>
                          {row.hint && (
                            <span className="relative z-[1] text-[12px]" style={{ color: on ? "rgba(255,255,255,.78)" : "#86868b" }}>
                              {row.hint}
                            </span>
                          )}
                          {row.sub && (
                            <span className="relative z-[1] flex" style={{ color: on ? "#fff" : "#86868b" }}>
                              <Icon name="chevron_right" size={11} />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </motion.div>
                </motion.div>

                <AnimatePresence>
                  {sub && (
                    <motion.div
                      key="sub"
                      {...panel("sub", true)!}
                      className={`pointer-events-auto absolute rounded-[13px] ${subSide === "over" ? "bg-white shadow-[0_0_0_.5px_rgba(0,0,0,.2),0_16px_30px_-10px_rgba(0,0,0,.3)]" : ""}`}
                      onPointerEnter={() => {
                        window.clearTimeout(subTimer.current);
                        setActive("move");
                      }}
                    >
                      <motion.div {...fade} role="menu" aria-label="Move To" onKeyDown={menuKey} onPointerLeave={() => setSubActive(null)} className="flex flex-col p-[6px]">
                        {folders.length ? (
                          folders.map((d) => {
                            const on = subActive === d.id;
                            return (
                              <button
                                key={d.id}
                                type="button"
                                role="menuitem"
                                data-sub={d.id}
                                tabIndex={-1}
                                onPointerEnter={() => {
                                  kb.current = false;
                                  setSubActive(d.id);
                                }}
                                onClick={() => act("move", file, d.id)}
                                className="relative flex h-[30px] w-full cursor-default items-center gap-2.5 rounded-[7px] border-0 bg-transparent px-2.5 text-left text-[13.5px] outline-none transition-colors duration-100"
                                style={{ color: on ? "#fff" : "#1d1d1f" }}
                              >
                                {on && <motion.span layoutId={`${uid}-hl2`} className="absolute inset-0 z-0 rounded-[7px] bg-[#0071e3]" transition={GLIDE} />}
                                <span className="relative z-[1] flex" style={{ color: on ? "#fff" : KIND.folder.tint }}>
                                  <Icon name="folder_fill" size={15} />
                                </span>
                                <span className="relative z-[1] min-w-0 flex-1 truncate">{d.name}</span>
                                <span className="relative z-[1] text-[12px] tabular-nums" style={{ color: on ? "rgba(255,255,255,.78)" : "#86868b" }}>
                                  {d.count ?? 0}
                                </span>
                              </button>
                            );
                          })
                        ) : (
                          <span className="flex h-[30px] items-center px-2.5 text-[13.5px] text-[#86868b]">No folders</span>
                        )}
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-3 z-40 flex justify-center px-3">
          <AnimatePresence>
            {toast && (
              <motion.div
                key={toast.n}
                role="status"
                initial={{ opacity: 0, y: 18, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.96, transition: { duration: 0.18 } }}
                transition={SPRING}
                className="pointer-events-auto flex max-w-full items-center gap-3 rounded-full bg-[#1d1d1f] py-2 pl-4 pr-2 text-[13px] text-white shadow-[0_12px_30px_-12px_rgba(0,0,0,.6)]"
              >
                <span className="min-w-0 truncate">{toast.text}</span>
                {toast.undo ? (
                  <button
                    type="button"
                    onClick={() => {
                      touched.current = true;
                      toast.undo?.();
                      setToast(null);
                    }}
                    className="flex shrink-0 cursor-pointer items-center gap-1 rounded-full border-0 bg-white/[.14] px-2.5 py-1 text-[12.5px] font-medium text-white outline-none transition-colors hover:bg-white/[.22] focus-visible:ring-2 focus-visible:ring-white/70"
                  >
                    <Icon name="arrow_uturn_left" size={12} />
                    Undo
                  </button>
                ) : (
                  <span className="w-1" />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default ContextMenu;
