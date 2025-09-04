import ChevronIcon from "@/components/icons/chevronIcon";
import { ExternalLinkIcon } from "@/components/icons/externalLinkIcon";
import { IconText } from "@/components/iconText";
import { ReactNode } from "react";

const FooterLinkItem = ({
  href = "#",
  children,
}: {
  href?: string;
  children: ReactNode;
}) => {
  return (
    <li className="hover-up">
      <a href={href}>
        <IconText IconBefore={ChevronIcon}>{children}</IconText>
      </a>
    </li>
  );
};

export const Footer = () => {
  return (
    <footer className="border-t border-t-[#282828] bg-[#535353] py-8 text-white shadow-[0_50vh_0_50vh_#535353]">
      <div className="mx-auto grid max-w-[1260px] grid-cols-1 justify-between gap-x-4 gap-y-8 px-2 sm:grid-cols-2 md:grid-cols-4">
        <nav aria-labelledby="over-deze-site" className="flex flex-col gap-5">
          <h3 id="over-deze-site" className="text-h3">
            Over deze site
          </h3>
          <ul className="flex flex-col gap-4">
            <FooterLinkItem>Wat is MijnOverheid Zakelijk</FooterLinkItem>
            <FooterLinkItem>Toegankelijkheid</FooterLinkItem>
            <FooterLinkItem>Sitemap</FooterLinkItem>
            <FooterLinkItem>English</FooterLinkItem>
          </ul>
        </nav>
        <nav
          aria-labelledby="gegevensverwerking"
          className="flex flex-col gap-3"
        >
          <h3 id="gegevensverwerking" className="text-h3">
            Gegevensverwerking
          </h3>
          <ul className="flex flex-col gap-4">
            <FooterLinkItem>Veiligheid</FooterLinkItem>
            <FooterLinkItem>Privacyverklaring</FooterLinkItem>
            <FooterLinkItem>Wet- en regelgeving</FooterLinkItem>
          </ul>
        </nav>
        <nav aria-labelledby="service" className="flex flex-col gap-3">
          <h3 id="service" className="text-h3">
            Service
          </h3>
          <ul className="flex flex-col gap-4">
            <FooterLinkItem>Mededelingen</FooterLinkItem>
            <FooterLinkItem>Herken oplichting</FooterLinkItem>
            <FooterLinkItem>Veelgestelde vragen</FooterLinkItem>
            <FooterLinkItem>Contact</FooterLinkItem>
            <FooterLinkItem>Klachtafhandeling</FooterLinkItem>
          </ul>
        </nav>
        <nav aria-labelledby="partners" className="flex flex-col gap-3">
          <h3 id="partners" className="text-h3">
            Partners
          </h3>
          <ul className="flex flex-col gap-4">
            <FooterLinkItem>Aangesloten organisaties</FooterLinkItem>
            <li className="hover-up">
              <a
                href={"https://www.overheid.nl/"}
                target="_blank"
                rel="noopener noreferrer"
              >
                <IconText
                  IconBefore={ExternalLinkIcon}
                  iconProps={{ className: "w-4" }}
                >
                  {"Overheid.nl"}
                </IconText>
              </a>
            </li>
            <li className="hover-up">
              <a
                href={"https://www.rijksoverheid.nl/"}
                target="_blank"
                rel="noopener noreferrer"
              >
                <IconText
                  IconBefore={ExternalLinkIcon}
                  iconProps={{ className: "w-4" }}
                >
                  {"Rijksoverheid.nl"}
                </IconText>
              </a>
            </li>
            <li className="hover-up">
              <a
                href={"https://www.rvig.nl/mfo-burgers"}
                target="_blank"
                rel="noopener noreferrer"
              >
                <IconText
                  IconBefore={ExternalLinkIcon}
                  iconProps={{ className: "w-4" }}
                >
                  {"Meldpunt Fouten in Overheidsregistraties"}
                </IconText>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
};
