# News Admin (Client)

A Next.js 14 admin dashboard for a travel / news platform — built with TypeScript, Tailwind CSS, Ant Design, Redux Toolkit (RTK Query) and CKEditor 5.

This repository contains the **client** application only.

---

## Tech Stack

- **Framework:** Next.js 14.2 (App Router)
- **Language:** TypeScript 5
- **UI:** Ant Design 5, Tailwind CSS 3, Framer Motion, Recharts / Visx / Ant Design Charts
- **State:** Redux Toolkit + RTK Query + redux-persist
- **Forms / Validation:** Zod
- **Editor:** CKEditor 5 + TinyMCE
- **Realtime:** Pusher JS
- **File / Media:** AWS SDK (S3), ant-design image uploaders
- **Auth:** jwt-decode + custom session helpers
- **Misc:** axios, lodash, dayjs, moment, crypto-js, jspdf, pdfmake, xlsx, sharp, world-countries
- **Deployment:** Docker (Dockerfile + docker-entry.sh) + PM2 ecosystem (`ecosystem.config.js`)

Scripts:

```bash
pnpm dev          # next dev
pnpm dev:secure   # tsx server.ts (custom server)
pnpm build        # next build
pnpm start        # next start -p 3005
pnpm lint         # next lint
```

---

## Project Structure

```text
client/
├── .vscode/
│   └── settings.json
│
├── public/
│   ├── README.md
│   ├── about-it.jpg
│   ├── auth-banner.jpg
│   ├── auth-logo.png
│   ├── auth_image.jpeg
│   ├── chess.png
│   ├── hasan.jpg
│   ├── logo-dark.png
│   ├── logo-square-dark.png
│   ├── logo-square.png
│   ├── logo.png
│   ├── map.svg
│   ├── placeholder.png
│   ├── fonts/
│   │   ├── Kalpurush.ttf
│   │   ├── Nikosh.ttf
│   │   ├── Siyamrupali.ttf
│   │   ├── SolaimanLipi.ttf
│   │   ├── SutonnyMJ-Bold.ttf
│   │   └── SutonnyMJ-Regular.ttf
│   └── svg/
│       ├── kaba.svg
│       └── tour.svg
│
├── src/
│   ├── assets/
│   │   ├── GlassClock.css
│   │   ├── map.svg
│   │   ├── test.tsx
│   │   ├── fonts/
│   │   │   └── NotoSans-Regular-normal.js
│   │   └── image/
│   │       ├── allback.jpg
│   │       ├── allbg.jpg
│   │       ├── auth_image.jpeg
│   │       ├── auth_imagez.jpeg
│   │       ├── logo2.png
│   │       └── profile.png
│   │
│   ├── components/
│   │   ├── fallback-chart.tsx
│   │   ├── live-clock.tsx
│   │   ├── search-form.tsx
│   │   ├── theme-context.tsx
│   │   ├── ck-editor/
│   │   │   ├── index.tsx
│   │   │   └── s3-upload-adapter.ts
│   │   ├── ck-editor-lite/
│   │   │   └── index.tsx
│   │   ├── common-icon/
│   │   │   ├── hotel-icon.tsx
│   │   │   ├── kabba.tsx
│   │   │   ├── tour-icon.tsx
│   │   │   └── visa-icon.tsx
│   │   ├── dashboard/                 # dashboard widgets & chart cards
│   │   │   ├── booking-card.tsx
│   │   │   ├── contact-info.tsx
│   │   │   ├── dashboard-card.tsx
│   │   │   ├── hajj-prebooking-chart.tsx
│   │   │   ├── overView.tsx
│   │   │   ├── recent-booking-info.tsx
│   │   │   ├── recent-enquiry-info.tsx
│   │   │   ├── recent-hajj-preregistration.tsx
│   │   │   ├── recent-review-info.tsx
│   │   │   ├── revenue-card.tsx
│   │   │   ├── revenue-pie-chart.tsx
│   │   │   ├── tour-chart.tsx
│   │   │   ├── user-pie-chart.tsx
│   │   │   └── visa-application-chart.tsx
│   │   ├── features/
│   │   │   ├── administration/{admins,modules,modules-permissions,roles}/...
│   │   │   ├── ads/...
│   │   │   ├── authoriztion/permission-modal.tsx
│   │   │   ├── b2b/{deposit-request,users}/...
│   │   │   ├── bookings/{dashboard-booked,issue-ticket-modal.tsx,view-booking-request-drawer.tsx}
│   │   │   ├── cancellation/{cancellation-edit-create-modal.tsx,cancellation-view-modal.tsx}
│   │   │   ├── configuration/
│   │   │   │   ├── airline-commission/, airlines/, airports/, bank/, bank-account/, cities/
│   │   │   │   ├── blog-model/{create-tags-model,create-tropic-model}
│   │   │   │   ├── common/{create-categories-model,create-countries-model,
│   │   │   │   │           create-location-categories-model,create-location-category-section,
│   │   │   │   │           edit-categories-components}
│   │   │   │   ├── DepartmentForm/, DesingnationForm/, EquipmentForm/, TeamForm/
│   │   │   │   ├── guide-designation/{CreateDesingnationForm,EditGuideDesignationForm}
│   │   │   │   ├── hajj/AvailabilityCalender/, tours-attributes-{items-,}models
│   │   │   │   ├── manual-reviews/{create,edit}-manual-reviewsModel
│   │   │   │   ├── tours/AvailabilityCalender/, tours-attributes-{items-,}models
│   │   │   │   ├── umrah/AvailabilityCalender/, umrah-attributes-{items-,}models
│   │   │   │   └── visa/AvailabilityCalendar/{VisaAvailabilityCalendar,VisaList,
│   │   │   │       VisaPriceDetailsModal,types}
│   │   │   ├── contactus/contact-details-modal.tsx
│   │   │   ├── countries/countries-edit-create-modal.tsx
│   │   │   ├── enquiry/{enquiry-details-modal,enquiry-details-view}
│   │   │   ├── hajj/
│   │   │   │   ├── hajj-view-model.tsx
│   │   │   │   ├── createHajj/   (15 sections: AdditionalInfo, AttributesSection,
│   │   │   │   │                 DiscountSection, ExtraPricing, FaqSection, HaJJDetails,
│   │   │   │   │                 HajjPrices, HotelsSection, IncludesExcludes,
│   │   │   │   │                 ItinerarySection, LinksStatus, PersonalPricing,
│   │   │   │   │                 ServiceFees, SurroundingsSection, TripHighlights,
│   │   │   │   │                 hajjCoreInformation)
│   │   │   │   └── updateHajj/  (Edit* sections, generatePayload, prepareHajjPayload, test.tsx)
│   │   │   ├── hotels/
│   │   │   │   ├── createFiles/  (HotelAdditionalInfo, HotelAttributesSection,
│   │   │   │   │                 HotelAvailability, HotelCoreInformation, HotelDetails,
│   │   │   │   │                 HotelExtraPricing, HotelHighlightsSection, HotelLinksStatus,
│   │   │   │   │                 HotelLocationSection, HotelPolicySection, HotelPrices,
│   │   │   │   │                 HotelServiceFees, HotelSurroundingsSection,
│   │   │   │   │                 RoomAttributesSection, RoomHighlightsSection,
│   │   │   │   │                 RoomPolicySection)
│   │   │   │   └── room/AvailabilityCalendar/{RoomAvailabilityCalendar,RoomList,
│   │   │   │       RoomPriceDetailsModal}
│   │   │   ├── media/{file-card,file-card-inline,global-file-picker,media-attachments,
│   │   │   │           media-details-modal,media-folders,media-stats,media-components.css}
│   │   │   ├── notifications/create-edit-popup-notice.tsx
│   │   │   ├── payment/{coupon,getway}/...
│   │   │   ├── profile/{activity-logs,change-password,profile-information}
│   │   │   ├── reissues/{reissue-edit-create-modal,reissue-reject-modal,reissue-view-modal}
│   │   │   ├── report/sales-report/{sales-report-statistics,view-sales-report-details}
│   │   │   ├── sepcial-fare/ (create-special-drawer, special-fare-details-modal,
│   │   │   │                   update-group-ticket-request-pnr,
│   │   │   │                   update-group-ticket-request-price,
│   │   │   │                   update-special-fare-drawer,
│   │   │   │                   view-group-booking-request-detail,
│   │   │   │                   view-group-ticket-request-details)
│   │   │   ├── specialoffers/specialoffer-edit-create-modal.tsx
│   │   │   ├── tours/
│   │   │   │   ├── TourEditform.tsx
│   │   │   │   ├── attributes/{creatEditattribute-model,update-attribute-modal}
│   │   │   │   ├── createFiles/   (AdditionalInfo, AttributesSection, CoreInformation,
│   │   │   │   │                   DiscountSection, ExtraPricing, FaqSection, HotelsSection,
│   │   │   │   │                   IncludesExcludes, ItinerarySection, LinksStatus,
│   │   │   │   │                   PersonalPricing, SeoManager, ServiceFees,
│   │   │   │   │                   SurroundingsSection, TourDetails, TourPrices, TripHighlights)
│   │   │   │   ├── editFiles/     (EditAdditionalInformation, EditCoreInformation,
│   │   │   │   │                   EditDiscoutPrice, EditFaqs, EditHotelPackagePricing,
│   │   │   │   │                   EditIncludesExcludes, EditItinerarySection,
│   │   │   │   │                   EditSurroundingAreas, EditTourAttributes, EditTourDetails,
│   │   │   │   │                   EditTourHotels, EditTourPrices, EditTripHighlights,
│   │   │   │   │                   ExtraPricing, LinksStatus, MediaAttachments,
│   │   │   │   │                   PersonalPricing, ServiceFees)
│   │   │   │   ├── sections/      (AdditionalInfo, CoreInformation, ExtraPricing,
│   │   │   │   │                   IncludesExcludes, ItinerarySection, LinksStatus,
│   │   │   │   │                   MediaAttachments, PersonalPricing, ServiceFees,
│   │   │   │   │                   TourDetails, TourHotels, TourPrices, TripHighlights)
│   │   │   │   ├── tour-edit/     (AttributesSection, Edit* sections, ExtraPricing,
│   │   │   │   │                   Image-up, LinksStatus, PersonalPricing, ServiceFees,
│   │   │   │   │                   generatePayload, prepareTourPayload, test.tsx)
│   │   │   │   └── validation/duplicateCheckers.ts
│   │   │   ├── transections/view-transection-details.tsx
│   │   │   ├── umrah/
│   │   │   │   ├── createUmrah/  (AdditionalInfo, AttributesSection, DiscountSection,
│   │   │   │   │                   ExtraPricing, FaqSection, HotelsSection, IncludesExcludes,
│   │   │   │   │                   ItinerarySection, LinksStatus, PersonalPricing,
│   │   │   │   │                   ServiceFees, SurroundingsSection, TripHighlights,
│   │   │   │   │                   UmrahDetails, hajjCoreInformation, umrahPrices)
│   │   │   │   └── updateUmrah/  (EditAdditionalInformation, EditCoreInformation,
│   │   │   │                       EditDiscountPrice, EditDiscoutPrice, EditFaqs,
│   │   │   │                       EditIncludesExcludes, EditItinerarySection,
│   │   │   │                       EditSurroundingAreas, EditTripHighlights,
│   │   │   │                       EditUmrahDetails, EditUmrahHotels, EditUmrahPrices,
│   │   │   │                       ExtraPricing, Image-up, LinksStatus, ServiceFees,
│   │   │   │                       UmrahEditPersonalPricing, AttributesSection,
│   │   │   │                       generatePayload, prepareHajjPayload, test.tsx)
│   │   │   ├── users/{access-rights-modal, account-info-form, address-additional-info-form,
│   │   │   │           assign-role-modal, delete-user-modal, otp-form, personal-info-form}
│   │   │   └── visa/
│   │   │       ├── edit-visa/   (AttributesSection, ExtraPricing, LinksStatus,
│   │   │       │                  PersonalPricing, ServiceFees, VisaImageUp, VisaPrices,
│   │   │       │                  faqs, prepareVisaPayload, useVisaForm, visa-Content)
│   │   │       ├── TopCountryModal/{TopCountryForm,TopCountryModal}
│   │   │       └── VisaLavelCreateModel/{VisaLevelModal,VisaLevelTable}
│   │   ├── Pusher/
│   │   │   ├── PusherUserInit.tsx
│   │   │   └── Listener/{ChannelNotificationListener,UserNotificationListener}
│   │   ├── shared/
│   │   │   ├── attribute-modal.tsx
│   │   │   ├── back-button.tsx
│   │   │   ├── breadcrumbs.tsx
│   │   │   ├── dashboard-layout.tsx
│   │   │   ├── header.tsx
│   │   │   ├── loader.tsx
│   │   │   ├── loading-spin.tsx
│   │   │   ├── notification-menu.tsx
│   │   │   ├── permission-guard.tsx
│   │   │   └── sidebar.tsx
│   │   ├── ui/{data-table,heading,image}.tsx
│   │   ├── utils/{ImageUploader,MultipleImage,ant-multiple-image-uploader,
│   │   │           ant-single-image-uploader,copy-button}.tsx + timeAgo.ts
│   │   └── visa/
│   │       ├── visa-add/   (AttributesSection, ExtraPricing, LinksStatus,
│   │       │                  PersonalPricing, ServiceFees, VisaPrices, faqs,
│   │       │                  visa-add-form, visa-Content)
│   │       ├── visa-attribute/{add-attribute-terms, add-attributes-form,
│   │       │                   edit-attribute-terms, visa-attribute-table,
│   │       │                   visa-attribute-terms-table}
│   │       └── visa-type/{add-visa-type, visa-type-table}
│   │
│   ├── config/index.ts
│   │
│   ├── constants/
│   │   ├── index.ts
│   │   ├── media.ts
│   │   ├── module_enum.ts
│   │   ├── moduleToRouteMap.ts
│   │   ├── modules-permissions.json
│   │   ├── permissionToRouteMap.ts
│   │   ├── permissions.json
│   │   ├── sidebar-data.ts
│   │   ├── tags.ts
│   │   └── user.ts
│   │
│   ├── global.d.ts
│   │
│   ├── helpers/
│   │   ├── axios/{axiosBaseQuery,axiosInstance}.ts
│   │   └── config/envConfig.ts
│   │
│   ├── hooks/
│   │   ├── use-debounce.tsx
│   │   ├── use-mobile.tsx
│   │   ├── use-file-upload.ts
│   │   ├── useAuth.tsx
│   │   ├── useCroppedArea.ts
│   │   ├── usePermissions.ts
│   │   └── useTourForm.ts
│   │
│   ├── lib/
│   │   ├── pusher-client.ts
│   │   ├── session.ts
│   │   ├── set-cookie.ts
│   │   └── utils.ts
│   │
│   ├── middleware.ts
│   │
│   ├── provider/
│   │   ├── redux-provider.tsx
│   │   └── session-provider.tsx
│   │
│   ├── redux/
│   │   ├── hooks.ts
│   │   ├── store.ts
│   │   ├── api/baseApi.ts
│   │   └── features/
│   │       ├── administration/{modules,roles}/*Api.ts
│   │       ├── advertisement/{advertisement,advertisementCategory,singleAdvertisement}Api.ts
│   │       ├── audit-logs/auditLogsApi.ts
│   │       ├── auth/{authApi,authSlice}.ts
│   │       ├── authoriztion/{modules,permission,role}Api.ts
│   │       ├── b2b/{groupBooking,groupTicket,specialFare,user}Api.ts
│   │       ├── Blog/{blog,comments,tags,tropic}Api.ts
│   │       ├── category/categoryApi.ts
│   │       ├── common/{enquiry,location,reviews}Api.ts
│   │       ├── configuration/
│   │       │   ├── airline/{airline,airlineCommision}Api.ts
│   │       │   ├── airports/airportsApi.ts
│   │       │   ├── bank/{bank,bankAccount}Api.ts
│   │       │   └── specialoffers/specialoffersApi.ts
│   │       ├── contactus/contactusApi.ts
│   │       ├── dashboard/dashboardApi.ts
│   │       ├── departmnet/departmentApi.ts
│   │       ├── designation/desingnationApi.ts
│   │       ├── equipment/equipmentApi.ts
│   │       ├── faqs/faqApi.ts
│   │       ├── flight/
│   │       │   ├── booking/bookingApi.ts
│   │       │   ├── cancellations/cancellationsApi.ts
│   │       │   └── reissues/reissuesApi.ts
│   │       ├── guide/{guide,guideDesignation}Api.ts
│   │       ├── hajj/{HajjAttribute,availability,hajj,hajjAttributesItem,
│   │       │          hajjPreRegistation}Api.ts
│   │       ├── hajj-umrah-booking/hajjumrahApi.ts
│   │       ├── highlights/highlightsApi.ts
│   │       ├── hotels/{booking,hotelRoom,hotels,roomAvailability}Api.ts
│   │       ├── location/{country,zone}Api.ts
│   │       ├── management/managementApi.ts
│   │       ├── media/{mediaApi,mediaSlice}.ts
│   │       ├── notice/noticeApi.ts
│   │       ├── notification/notificationApi.ts
│   │       ├── offers/OfferApi.ts
│   │       ├── page/pageApi.ts
│   │       ├── payments/{coupon,deposit,gateway}Api.ts
│   │       ├── report/{report,transection}Api.ts
│   │       ├── team/teamApi.ts
│   │       ├── tours/{availability,booking,tour,tourAttribute,tourAttributesItem}Api.ts
│   │       ├── umrah/umrahPreRegistationApi.ts
│   │       ├── user/{permissionSlice,userApi,userSlice}.ts
│   │       ├── utils/{galleries,manual-reviews,utils}Api.ts
│   │       ├── visa/{VisaAttribute,top-countries-list,visa,visaAppoinments,
│   │       │          visaAttributesItem,visaAvailability,visa-level}Api.ts
│   │       └── zone/{city,country,popular-country}Api.ts
│   │
│   ├── schema/
│   │   ├── change-password.schema.ts
│   │   ├── signin.schema.ts
│   │   └── signup.schema.ts
│   │
│   ├── service/
│   │   ├── auth.ts
│   │   ├── permission.ts
│   │   └── tour.ts
│   │
│   ├── styles/
│   │   ├── GlassClock.css
│   │   └── globals.css
│   │
│   ├── types/                       # 39 type/interfaces (administration, advertisement,
│   │   │                           # audit-logs, authoriztion, b2b, b2c, blog, bookings,
│   │   │                           # category, configuration, contactus, dashboard,
│   │   │                           # department, enquiry, faqs, flight, global, guide,
│   │   │                           # guide-designation, hajj, hajj-edit, highlights,
│   │   │                           # hotelRoomBooking, hotels, index, location, management,
│   │   │                           # manual-reviews, media, notice, offers, page, payment,
│   │   │                           # report, reviews, tour, tour-edit, TSession, umrah,
│   │   │                           # user, visa, zone)
│   │
│   ├── utils/
│   │   ├── buildCleanPermissions.ts
│   │   ├── crypto.ts
│   │   ├── currency-formater.ts
│   │   ├── fileObjectToLink.ts
│   │   ├── filterMenuByAccess.ts
│   │   ├── generateCleanPayload.ts
│   │   ├── generatePayload.ts
│   │   ├── get-changes.ts
│   │   ├── getStringUrl.ts
│   │   ├── handleFileUploderFileProgress.ts
│   │   ├── image-convert.ts
│   │   ├── local-storage.ts
│   │   ├── object-cleaner.ts
│   │   ├── permissionMap.ts
│   │   ├── permissions.ts
│   │   └── slug-maker.ts
│   │
│   └── app/                         # Next.js App Router (top-level pages/layouts)
│       ├── error.tsx
│       ├── favicon.ico
│       ├── layout.tsx
│       ├── loading.tsx
│       ├── not-found.tsx
│       ├── 403/page.tsx
│       ├── auth/
│       │   ├── layout.tsx
│       │   ├── forgot-password/page.tsx
│       │   └── signin/page.tsx
│       └── dashboard/
│           ├── layout.tsx
│           ├── page.tsx
│           ├── not-found.tsx
│           ├── administration/{admins,b2cusers}/page.tsx
│           ├── advertisement/{category,loading,page}.tsx
│           ├── audit-logs/{page,[id]/page}.tsx
│           ├── authoriztion/
│           │   ├── modules/{page,create/page,edit/[id]/page}.tsx
│           │   ├── permissions/page.tsx
│           │   └── roles/{page,create/page,edit/[id]/page}.tsx
│           ├── blog/{blog-edit,comments,create,list,tags,topics}/page.tsx
│           ├── booked/{page,view/page}.tsx
│           ├── category/{label-value,list,location-category}/page.tsx
│           ├── configuration/
│           │   ├── airline-commission/page.tsx
│           │   ├── airlines/page.tsx
│           │   ├── airports/page.tsx
│           │   ├── bank-accounts/page.tsx
│           │   ├── banks/page.tsx
│           │   ├── cities/page.tsx
│           │   ├── countries/page.tsx
│           │   └── special-offers/{page,create/page,edit/[id]/page}.tsx
│           ├── contact/page.tsx
│           ├── country/page.tsx
│           ├── department/page.tsx
│           ├── desingnation/page.tsx
│           ├── equipment/{page,create/page,edit/[id]/page,view/page}.tsx
│           ├── faqs/{create,faqs-edit,list}/page.tsx
│           ├── gallery/
│           │   ├── components/{GalleryFormModal,GalleryTable}.tsx
│           │   ├── page.tsx
│           │   ├── create/page.tsx
│           │   └── edit/[id]/page.tsx
│           ├── guide/{create,guide-designation,guide-edit,list}/page.tsx
│           ├── hajj/
│           │   ├── add-new-hajj/page.tsx
│           │   ├── all-hajj/page.tsx
│           │   ├── attributes/{page,[id]/page}.tsx
│           │   ├── availablity/page.tsx
│           │   ├── edit/{page,useHajjInvoiceForm}.tsx
│           │   ├── enquiry/{page,view/page}.tsx
│           │   ├── pre-registationlist/page.tsx
│           │   └── view/page.tsx
│           ├── hotel/
│           │   ├── create/page.tsx
│           │   ├── edit/[id]/page.tsx
│           │   ├── highlights/page.tsx
│           │   ├── hotelAttributes/{page,[id]/page}.tsx
│           │   ├── list/page.tsx
│           │   ├── room/{[id]/page,[id]/availability/page,
│           │   │         [id]/create/page,[id]/edit/page}
│           │   └── room-attributes/{page,[id]/page}.tsx
│           ├── management/list/page.tsx
│           ├── manual-review/{page,list/page}.tsx
│           ├── media/{loading,media.css,page}.tsx
│           ├── notifications/{page,[id]/page}.tsx
│           ├── offers/{create,edit,list}/page.tsx
│           ├── pages/{page,create/page,edit/[id]/page}.tsx
│           ├── payment/{coupon,gateway}/page.tsx
│           ├── popular-country/page.tsx
│           ├── profile/page.tsx
│           ├── reports/{sales-reports,transactions-history}/page.tsx
│           ├── reviews/page.tsx
│           ├── special-fare/{page,group-booking-request/page,group-ticket-request/page}.tsx
│           ├── team/{create,edit,list}/page.tsx
│           ├── tour/
│           │   ├── availablity/page.tsx
│           │   ├── booking/{page,view/page}.tsx
│           │   ├── create/page.tsx
│           │   ├── edit/{[id]/page,[id]/tour-edit-client}.tsx
│           │   ├── enquiry/{page,view/page}.tsx
│           │   ├── list/page.tsx
│           │   ├── recovery/page.tsx
│           │   ├── tourAttributes/{page,[id]/page}.tsx
│           │   └── tour-edit/{page,useTourInVoiceForm}.tsx
│           ├── umrah/
│           │   ├── attributes/{page,[id]/page}.tsx
│           │   ├── availablity/page.tsx
│           │   ├── create/page.tsx
│           │   ├── edit/{page,useHajjInvoiceForm}.tsx
│           │   ├── enquiry/{page,view/page}.tsx
│           │   └── list/page.tsx
│           ├── visa/
│           │   ├── add-new-visa/page.tsx
│           │   ├── all-visa/page.tsx
│           │   ├── appointments/{page,view/page}.tsx
│           │   ├── attributes/{page,[id]/page}.tsx
│           │   ├── availability/page.tsx
│           │   ├── edit/page.tsx
│           │   ├── enquiry/{page,view/page}.tsx
│           │   ├── recovery/page.tsx
│           │   ├── top-country-list/page.tsx
│           │   └── visa-type/page.tsx
│           └── zone/page.tsx
│
├── .dockerignore
├── .env
├── .env.production
├── .eslintrc.json
├── .gitignore
├── Dockerfile
├── docker-entry.sh
├── ecosystem.config.js
├── next.config.mjs
├── package.json
├── pnpm-lock.yaml
├── postcss.config.mjs
├── README.md
├── tailwind.config.ts
└── tsconfig.json
```

> Note: `.env`, `.env.production`, `node_modules/`, `.next/`, build artifacts and IDE temp files are intentionally excluded from the tree.

---

## Folder Overview

### `src/app`
Next.js App Router entry point. `app/layout.tsx`, `app/error.tsx`, `app/loading.tsx`, `app/not-found.tsx`, and `app/403/` are top-level public pages. The `app/auth/` group contains the unauthenticated flow (`signin`, `forgot-password`, dedicated `layout.tsx`). Everything else lives under `app/dashboard/` (admin panel), with `app/dashboard/layout.tsx` providing the protected shell.

### `src/components`
Reusable UI broken down by responsibility:

- `ck-editor/`, `ck-editor-lite/` — rich-text editors and an S3 upload adapter.
- `common-icon/` — small SVG/icon components reused across modules.
- `dashboard/` — KPI cards, charts and recent-activity widgets used on the dashboard home.
- `features/` — feature-scoped components, grouped by domain (administration, hajj, umrah, tours, hotels, visa, configuration, payment, etc.). Big domains like `hajj`/`umrah`/`tours`/`hotels` split into `create*` / `update*` / `edit*` / `sections` / `validation` sub-folders to mirror create/edit wizards.
- `Pusher/` — realtime listeners for notifications.
- `shared/` — app-wide chrome (`header`, `sidebar`, `dashboard-layout`, `breadcrumbs`, `permission-guard`, `notification-menu`, loaders, etc.).
- `ui/` — generic primitives (`data-table`, `heading`, `image`).
- `utils/` — cross-feature helpers (image uploaders, copy-button, time-ago).
- Top-level `visa/` directory holds legacy visa components grouped by `visa-add/`, `visa-attribute/`, `visa-type/` (note: there is also a `features/visa/` — see *Suspicious Structure* below).

### `src/redux`
Redux Toolkit store + RTK Query API slices. `store.ts` configures the store and `api/baseApi.ts` is the shared RTK Query base. `features/*` is organised by domain — every API slice (`*Api.ts`) lives next to its slice state (`*Slice.ts`) so a feature folder contains both the network surface and the local reducer.

### `src/schema`
Zod schemas for forms: `change-password.schema.ts`, `signin.schema.ts`, `signup.schema.ts`.

### `src/service`
Non-RTK service modules (`auth.ts`, `permission.ts`, `tour.ts`) that wrap axios helpers used outside the Redux store.

### `src/types`
Plain TypeScript types/interfaces grouped by domain (one file per feature, plus `index.ts` as a re-export barrel).

### `src/lib`
Tiny shared libs: `pusher-client.ts`, `session.ts`, `set-cookie.ts`, `utils.ts` (the `cn()` helper from `tailwind-merge` + `clsx`).

### `src/hooks`
Custom React hooks: `useAuth`, `usePermissions`, `use-debounce`, `use-mobile`, `use-file-upload`, `useCroppedArea`, `useTourForm`.

### `src/helpers`
Axios layer (`axiosBaseQuery` for RTK Query + a plain `axiosInstance`) and `envConfig.ts` that reads `process.env` safely.

### `src/provider`
React context providers wired in `app/layout.tsx`: `redux-provider.tsx`, `session-provider.tsx`.

### `src/middleware.ts`
Next.js middleware — typically used to gate routes / refresh session.

### `src/styles`
Global CSS: `globals.css` (Tailwind layers + custom utilities) and `GlassClock.css` for the live-clock component.

### `src/constants`
Static config: `sidebar-data.ts`, route/permission maps (`moduleToRouteMap`, `permissionToRouteMap`), `modules-permissions.json` + `permissions.json`, `module_enum.ts`, `tags.ts`, `media.ts`, `user.ts`, and an `index.ts` barrel.

### `src/config`
Single-file runtime config (`config/index.ts`).

### `src/assets`
Bundled static assets that are imported from components: a custom font (`NotoSans-Regular-normal.js`) plus background images and a `map.svg`/`test.tsx`.

### `public/`
Publicly served static files — `logo*.png`, `auth-*`, `chess.png`, `placeholder.png`, plus the bundled Bengali fonts under `public/fonts/` and decorative SVGs under `public/svg/`.

### Top-level configs
`next.config.mjs`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`, `.eslintrc.json`, `Dockerfile` + `docker-entry.sh` + `.dockerignore`, `ecosystem.config.js` (PM2), `pnpm-lock.yaml`. Environment values live in `.env` / `.env.production` (not committed in plain form for secrets — keep an `.env.example` if you ship one).

---

## Build / Run

```bash
pnpm install
pnpm dev            # http://localhost:3000
pnpm dev:secure     # custom server (tsx server.ts)
pnpm build && pnpm start    # production on :3005
```

Container:

```bash
docker build -t news-admin-client .
# entry script: docker-entry.sh
```

---

## Notes / Suspicious Structure

These are observations only — **no files were modified or removed**.

- **Duplicate domain folders:** there are two visa-related component trees.
  - `src/components/visa/` — `visa-add/`, `visa-attribute/`, `visa-type/` (legacy top-level)
  - `src/components/features/visa/` — `edit-visa/`, `TopCountryModal/`, `VisaLavelCreateModel/`
  
  Same pattern exists under `src/redux/features/` for visa. Worth consolidating later.

- **Typos / oddly-named paths:**
  - `src/app/dashboard/authoriztion/` — should be `authorization` (also mirrored at `src/redux/features/authoriztion/`, `src/types/authoriztion.ts`, `src/components/features/authoriztion/`).
  - `src/app/dashboard/desingnation/` and the matching `DesingnationForm/`, `desingnationApi.ts`, `desingnation.ts` — should be `designation`.
  - `src/app/dashboard/hajj/pre-registationlist/` — should be `pre-registration-list` (also `hajjPreRegistationApi.ts`, `umrahPreRegistationApi.ts`).
  - `src/app/dashboard/hajj/availablity/`, `tour/availablity/`, `umrah/availablity/`, `visa/availability/` — inconsistent spelling (`availability` vs `availablity`).
  - `src/components/features/sepcial-fare/` — should be `special-fare` (also `specialFareApi.ts` references it).
  - `src/redux/features/departmnet/departmentApi.ts` — folder name has the typo.
  - `src/redux/features/visa/visaAppoinmentsApi.ts`, `visaAppoinments` page — should be `appointments`.
  - `src/redux/features/visa/visa-levelApi.ts` (kebab in filename) and `visaAppoinments` page vs the rest of camelCase — inconsistent naming.

- **Duplicate edit/create folders for big domains:** `hajj/`, `umrah/`, `tours/` each have `create*`/`update*`/`edit*`/`sections` directories, and many files are nearly identical (`EditDiscountPrice.tsx` vs `EditDiscoutPrice.tsx` — different spelling). Suggest a refactor with a shared `FormSection` primitive.

- **Test files inside production folders:** `src/assets/test.tsx`, `src/components/features/hajj/updateHajj/test.tsx`, `src/components/features/tours/tour-edit/test.tsx`, `src/components/features/umrah/updateUmrah/test.tsx`. These are likely scratch files left in the repo.

- **Empty or near-empty leaves:** `src/app/dashboard/administration/` exists but only `admins/page.tsx` and `b2cusers/page.tsx` — no `index` page. Several folders (`gallery/components`, `hajj/edit`, `umrah/edit`, `tour/edit`, `tour/tour-edit`) contain files with no `page.tsx` (just helper hooks/components). Not bugs, but worth knowing.

- **`src/assets/` vs `public/` overlap:** both contain `map.svg`, `auth_image.jpeg` variants, `logo*.png`. Decide on a single source of truth.

- **No `.env.example`** — only `.env` and `.env.production` are committed. Consider adding a sanitised `.env.example`.

- **`pnpm-lock.yaml` is committed** but no `pnpm-workspace.yaml` — looks like a single-package repo, not a monorepo, despite the `Task/client` parent path.