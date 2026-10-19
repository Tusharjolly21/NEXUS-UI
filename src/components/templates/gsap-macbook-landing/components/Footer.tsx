import {footerLinks} from "../constants/index";

const Footer = () => {
    return (
        <footer>
            <div className="info">
                <p>More ways to shop: visit a Halcyon studio or an authorised retailer near you, or call 1-800-555-0142.</p>
                <img src="/halcyon-logo.svg" alt="Halcyon" />
            </div>

            <hr />

            <div className="links">
                <p>Copyright © 2026 Halcyon Computing. All rights reserved.</p>

                <ul>
                    {footerLinks.map(({label, link }) => (
                        <li key={label}>
                            <a href={link}>{label}</a>
                        </li>
                    ))}
                </ul>
            </div>
        </footer>
    )
}
export default Footer
