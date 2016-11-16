var countries = {
    findName: function(code){
        var name;
        var i = 0;
        while(!name && i < countries.list.length) {
            if (countries.list[i].id === code) {
                name = countries.list[i].label;
            }
            i++;
        }
        return name;
    },
    list: [{"id":"GB","label":"United Kingdom (GB)"},{"id":"US","label":"United States (US)"},{"id":"AF","label":"Afghanistan (AF)"},{"id":"AX","label":"Aland Islands (AX)"},{"id":"AL","label":"Albania (AL)"},{"id":"DZ","label":"Algeria (DZ)"},{"id":"AS","label":"American Samoa (AS)"},{"id":"AD","label":"Andorra (AD)"},{"id":"AO","label":"Angola (AO)"},{"id":"AI","label":"Anguilla (AI)"},{"id":"AQ","label":"Antarctica (AQ)"},{"id":"AG","label":"Antigua and Barbuda (AG)"},{"id":"AR","label":"Argentina (AR)"},{"id":"AM","label":"Armenia (AM)"},{"id":"AW","label":"Aruba (AW)"},{"id":"AU","label":"Australia (AU)"},{"id":"AT","label":"Austria (AT)"},{"id":"AZ","label":"Azerbaijan (AZ)"},{"id":"BS","label":"Bahamas (BS)"},{"id":"BH","label":"Bahrain (BH)"},{"id":"BD","label":"Bangladesh (BD)"},{"id":"BB","label":"Barbados (BB)"},{"id":"BY","label":"Belarus (BY)"},{"id":"BE","label":"Belgium (BE)"},{"id":"BZ","label":"Belize (BZ)"},{"id":"BJ","label":"Benin (BJ)"},{"id":"BM","label":"Bermuda (BM)"},{"id":"BT","label":"Bhutan (BT)"},{"id":"BO","label":"Bolivia (BO)"},{"id":"BQ","label":"Bonaire, Saint Eustatius and Saba  (BQ)"},{"id":"BA","label":"Bosnia and Herzegovina (BA)"},{"id":"BW","label":"Botswana (BW)"},{"id":"BV","label":"Bouvet Island (BV)"},{"id":"BR","label":"Brazil (BR)"},{"id":"IO","label":"British Indian Ocean Territory (IO)"},{"id":"VG","label":"British Virgin Islands (VG)"},{"id":"BN","label":"Brunei (BN)"},{"id":"BG","label":"Bulgaria (BG)"},{"id":"BF","label":"Burkina Faso (BF)"},{"id":"BI","label":"Burundi (BI)"},{"id":"KH","label":"Cambodia (KH)"},{"id":"CM","label":"Cameroon (CM)"},{"id":"CA","label":"Canada (CA)"},{"id":"CV","label":"Cape Verde (CV)"},{"id":"KY","label":"Cayman Islands (KY)"},{"id":"CF","label":"Central African Republic (CF)"},{"id":"TD","label":"Chad (TD)"},{"id":"CL","label":"Chile (CL)"},{"id":"CN","label":"China (CN)"},{"id":"CX","label":"Christmas Island (CX)"},{"id":"CC","label":"Cocos Islands (CC)"},{"id":"CO","label":"Colombia (CO)"},{"id":"KM","label":"Comoros (KM)"},{"id":"CK","label":"Cook Islands (CK)"},{"id":"CR","label":"Costa Rica (CR)"},{"id":"HR","label":"Croatia (HR)"},{"id":"CU","label":"Cuba (CU)"},{"id":"CW","label":"Curacao (CW)"},{"id":"CY","label":"Cyprus (CY)"},{"id":"CZ","label":"Czech Republic (CZ)"},{"id":"CD","label":"Democratic Republic of the Congo (CD)"},{"id":"DK","label":"Denmark (DK)"},{"id":"DJ","label":"Djibouti (DJ)"},{"id":"DM","label":"Dominica (DM)"},{"id":"DO","label":"Dominican Republic (DO)"},{"id":"TL","label":"East Timor (TL)"},{"id":"EC","label":"Ecuador (EC)"},{"id":"EG","label":"Egypt (EG)"},{"id":"SV","label":"El Salvador (SV)"},{"id":"GQ","label":"Equatorial Guinea (GQ)"},{"id":"ER","label":"Eritrea (ER)"},{"id":"EE","label":"Estonia (EE)"},{"id":"ET","label":"Ethiopia (ET)"},{"id":"FK","label":"Falkland Islands (FK)"},{"id":"FO","label":"Faroe Islands (FO)"},{"id":"FJ","label":"Fiji (FJ)"},{"id":"FI","label":"Finland (FI)"},{"id":"FR","label":"France (FR)"},{"id":"GF","label":"French Guiana (GF)"},{"id":"PF","label":"French Polynesia (PF)"},{"id":"TF","label":"French Southern Territories (TF)"},{"id":"GA","label":"Gabon (GA)"},{"id":"GM","label":"Gambia (GM)"},{"id":"GE","label":"Georgia (GE)"},{"id":"DE","label":"Germany (DE)"},{"id":"GH","label":"Ghana (GH)"},{"id":"GI","label":"Gibraltar (GI)"},{"id":"GR","label":"Greece (GR)"},{"id":"GL","label":"Greenland (GL)"},{"id":"GD","label":"Grenada (GD)"},{"id":"GP","label":"Guadeloupe (GP)"},{"id":"GU","label":"Guam (GU)"},{"id":"GT","label":"Guatemala (GT)"},{"id":"GG","label":"Guernsey (GG)"},{"id":"GN","label":"Guinea (GN)"},{"id":"GW","label":"Guinea-Bissau (GW)"},{"id":"GY","label":"Guyana (GY)"},{"id":"HT","label":"Haiti (HT)"},{"id":"HM","label":"Heard Island and McDonald Islands (HM)"},{"id":"HN","label":"Honduras (HN)"},{"id":"HK","label":"Hong Kong (HK)"},{"id":"HU","label":"Hungary (HU)"},{"id":"IS","label":"Iceland (IS)"},{"id":"IN","label":"India (IN)"},{"id":"ID","label":"Indonesia (ID)"},{"id":"IR","label":"Iran (IR)"},{"id":"IQ","label":"Iraq (IQ)"},{"id":"IE","label":"Ireland (IE)"},{"id":"IM","label":"Isle of Man (IM)"},{"id":"IL","label":"Israel (IL)"},{"id":"IT","label":"Italy (IT)"},{"id":"CI","label":"Ivory Coast (CI)"},{"id":"JM","label":"Jamaica (JM)"},{"id":"JP","label":"Japan (JP)"},{"id":"JE","label":"Jersey (JE)"},{"id":"JO","label":"Jordan (JO)"},{"id":"KZ","label":"Kazakhstan (KZ)"},{"id":"KE","label":"Kenya (KE)"},{"id":"KI","label":"Kiribati (KI)"},{"id":"XK","label":"Kosovo (XK)"},{"id":"KW","label":"Kuwait (KW)"},{"id":"KG","label":"Kyrgyzstan (KG)"},{"id":"LA","label":"Laos (LA)"},{"id":"LV","label":"Latvia (LV)"},{"id":"LB","label":"Lebanon (LB)"},{"id":"LS","label":"Lesotho (LS)"},{"id":"LR","label":"Liberia (LR)"},{"id":"LY","label":"Libya (LY)"},{"id":"LI","label":"Liechtenstein (LI)"},{"id":"LT","label":"Lithuania (LT)"},{"id":"LU","label":"Luxembourg (LU)"},{"id":"MO","label":"Macao (MO)"},{"id":"MK","label":"Macedonia (MK)"},{"id":"MG","label":"Madagascar (MG)"},{"id":"MW","label":"Malawi (MW)"},{"id":"MY","label":"Malaysia (MY)"},{"id":"MV","label":"Maldives (MV)"},{"id":"ML","label":"Mali (ML)"},{"id":"MT","label":"Malta (MT)"},{"id":"MH","label":"Marshall Islands (MH)"},{"id":"MQ","label":"Martinique (MQ)"},{"id":"MR","label":"Mauritania (MR)"},{"id":"MU","label":"Mauritius (MU)"},{"id":"YT","label":"Mayotte (YT)"},{"id":"MX","label":"Mexico (MX)"},{"id":"FM","label":"Micronesia (FM)"},{"id":"MD","label":"Moldova (MD)"},{"id":"MC","label":"Monaco (MC)"},{"id":"MN","label":"Mongolia (MN)"},{"id":"ME","label":"Montenegro (ME)"},{"id":"MS","label":"Montserrat (MS)"},{"id":"MA","label":"Morocco (MA)"},{"id":"MZ","label":"Mozambique (MZ)"},{"id":"MM","label":"Myanmar (MM)"},{"id":"NA","label":"Namibia (NA)"},{"id":"NR","label":"Nauru (NR)"},{"id":"NP","label":"Nepal (NP)"},{"id":"NL","label":"Netherlands (NL)"},{"id":"NC","label":"New Caledonia (NC)"},{"id":"NZ","label":"New Zealand (NZ)"},{"id":"NI","label":"Nicaragua (NI)"},{"id":"NE","label":"Niger (NE)"},{"id":"NG","label":"Nigeria (NG)"},{"id":"NU","label":"Niue (NU)"},{"id":"NF","label":"Norfolk Island (NF)"},{"id":"KP","label":"North Korea (KP)"},{"id":"MP","label":"Northern Mariana Islands (MP)"},{"id":"NO","label":"Norway (NO)"},{"id":"OM","label":"Oman (OM)"},{"id":"PK","label":"Pakistan (PK)"},{"id":"PW","label":"Palau (PW)"},{"id":"PS","label":"Palestinian Territory (PS)"},{"id":"PA","label":"Panama (PA)"},{"id":"PG","label":"Papua New Guinea (PG)"},{"id":"PY","label":"Paraguay (PY)"},{"id":"PE","label":"Peru (PE)"},{"id":"PH","label":"Philippines (PH)"},{"id":"PN","label":"Pitcairn (PN)"},{"id":"PL","label":"Poland (PL)"},{"id":"PT","label":"Portugal (PT)"},{"id":"PR","label":"Puerto Rico (PR)"},{"id":"QA","label":"Qatar (QA)"},{"id":"CG","label":"Republic of the Congo (CG)"},{"id":"RE","label":"Reunion (RE)"},{"id":"RO","label":"Romania (RO)"},{"id":"RU","label":"Russia (RU)"},{"id":"RW","label":"Rwanda (RW)"},{"id":"BL","label":"Saint Barthelemy (BL)"},{"id":"SH","label":"Saint Helena (SH)"},{"id":"KN","label":"Saint Kitts and Nevis (KN)"},{"id":"LC","label":"Saint Lucia (LC)"},{"id":"MF","label":"Saint Martin (MF)"},{"id":"PM","label":"Saint Pierre and Miquelon (PM)"},{"id":"VC","label":"Saint Vincent and the Grenadines (VC)"},{"id":"WS","label":"Samoa (WS)"},{"id":"SM","label":"San Marino (SM)"},{"id":"ST","label":"Sao Tome and Principe (ST)"},{"id":"SA","label":"Saudi Arabia (SA)"},{"id":"SN","label":"Senegal (SN)"},{"id":"RS","label":"Serbia (RS)"},{"id":"SC","label":"Seychelles (SC)"},{"id":"SL","label":"Sierra Leone (SL)"},{"id":"SG","label":"Singapore (SG)"},{"id":"SX","label":"Sint Maarten (SX)"},{"id":"SK","label":"Slovakia (SK)"},{"id":"SI","label":"Slovenia (SI)"},{"id":"SB","label":"Solomon Islands (SB)"},{"id":"SO","label":"Somalia (SO)"},{"id":"ZA","label":"South Africa (ZA)"},{"id":"GS","label":"South Georgia and the South Sandwich Islands (GS)"},{"id":"KR","label":"South Korea (KR)"},{"id":"SS","label":"South Sudan (SS)"},{"id":"ES","label":"Spain (ES)"},{"id":"LK","label":"Sri Lanka (LK)"},{"id":"SD","label":"Sudan (SD)"},{"id":"SR","label":"Suriname (SR)"},{"id":"SJ","label":"Svalbard and Jan Mayen (SJ)"},{"id":"SZ","label":"Swaziland (SZ)"},{"id":"SE","label":"Sweden (SE)"},{"id":"CH","label":"Switzerland (CH)"},{"id":"SY","label":"Syria (SY)"},{"id":"TW","label":"Taiwan (TW)"},{"id":"TJ","label":"Tajikistan (TJ)"},{"id":"TZ","label":"Tanzania (TZ)"},{"id":"TH","label":"Thailand (TH)"},{"id":"TG","label":"Togo (TG)"},{"id":"TK","label":"Tokelau (TK)"},{"id":"TO","label":"Tonga (TO)"},{"id":"TT","label":"Trinidad and Tobago (TT)"},{"id":"TN","label":"Tunisia (TN)"},{"id":"TR","label":"Turkey (TR)"},{"id":"TM","label":"Turkmenistan (TM)"},{"id":"TC","label":"Turks and Caicos Islands (TC)"},{"id":"TV","label":"Tuvalu (TV)"},{"id":"VI","label":"U.S. Virgin Islands (VI)"},{"id":"UG","label":"Uganda (UG)"},{"id":"UA","label":"Ukraine (UA)"},{"id":"AE","label":"United Arab Emirates (AE)"},{"id":"UM","label":"United States Minor Outlying Islands (UM)"},{"id":"UY","label":"Uruguay (UY)"},{"id":"UZ","label":"Uzbekistan (UZ)"},{"id":"VU","label":"Vanuatu (VU)"},{"id":"VA","label":"Vatican (VA)"},{"id":"VE","label":"Venezuela (VE)"},{"id":"VN","label":"Vietnam (VN)"},{"id":"WF","label":"Wallis and Futuna (WF)"},{"id":"EH","label":"Western Sahara (EH)"},{"id":"YE","label":"Yemen (YE)"},{"id":"ZM","label":"Zambia (ZM)"},{"id":"ZW","label":"Zimbabwe (ZW)"}]
};

