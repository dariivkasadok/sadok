import { Building2, MapPin, Mail, Phone } from "lucide-react";

const InstitutionCard = () => {
  return (
    <div className="rounded-2xl bg-card p-8 shadow-sm">
      <div className="flex items-start gap-6">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-secondary text-4xl">
          🍒
        </div>
        <div className="flex-1">
          <h1 className="mb-6 text-center text-2xl font-extrabold text-foreground">
            Дар'ївський заклад дошкільної освіти Дар'ївської сільської ради Херсонського району Херсонської області
          </h1>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InfoItem
              icon={<Building2 className="h-5 w-5 text-primary" />}
              label="ЄДРПОУ"
              value="24754240"
              bgClass="bg-accent"
            />
            <InfoItem
              icon={<MapPin className="h-5 w-5 text-secondary-foreground" />}
              label="Юридична адреса"
              value="75032 Херсонська обл., Херсонський р-н, с. Дар'ївка, вул. Травнева (Першотравнева), 72"
              bgClass="bg-secondary"
            />
            <InfoItem
              icon={<Mail className="h-5 w-5 text-accent-foreground" />}
              label="E-mail"
              value="dariivkasadok@ukr.net"
              bgClass="bg-accent"
            />
            <InfoItem
              icon={<Phone className="h-5 w-5 text-stat-green-text" />}
              label="Телефон"
              value="+380 44 123 4567"
              bgClass="bg-stat-green"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({
  icon,
  label,
  value,
  bgClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  bgClass: string;
}) => (
  <div className="flex items-center gap-3">
    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${bgClass}`}>
      {icon}
    </div>
    <div>
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
      <p className="text-sm font-bold text-foreground">{value}</p>
    </div>
  </div>
);

export default InstitutionCard;
