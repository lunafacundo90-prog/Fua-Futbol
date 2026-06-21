export default function Privacidad() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-green-950 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-green-400">
          Política de Privacidad de FUA!
        </h1>

        <p className="text-zinc-400">
          Última actualización: junio de 2026.
        </p>

        <section>
          <h2 className="text-2xl font-bold mb-2">
            1. Información que recopilamos
          </h2>

          <p>
            FUA! recopila la información que los usuarios proporcionan al
            registrarse y utilizar la plataforma.
          </p>

          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li>Nombre o apodo.</li>
            <li>Edad.</li>
            <li>Zona o ubicación general.</li>
            <li>Posición y nivel de juego.</li>
            <li>Fotografía de perfil.</li>
            <li>Valoraciones, comentarios y reputación.</li>
            <li>Información relacionada con los partidos publicados o jugados.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-2">
            2. Uso de la información
          </h2>

          <p>La información recopilada se utiliza para:</p>

          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li>Permitir el funcionamiento de la plataforma.</li>
            <li>Facilitar la organización de partidos.</li>
            <li>Mostrar perfiles, reputaciones y valoraciones.</li>
            <li>Mejorar la seguridad y la experiencia de los usuarios.</li>
            <li>Prevenir usos indebidos o fraudulentos.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-2">
            3. Compartición de datos
          </h2>

          <p>
            FUA! no vende ni alquila información personal a terceros.
          </p>

          <p className="mt-2">
            Algunos datos del perfil, como el nombre, la fotografía, la zona,
            las valoraciones y la reputación, podrán ser visibles para otros
            usuarios con el fin de facilitar la interacción dentro de la
            plataforma.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-2">
            4. Seguridad de la información
          </h2>

          <p>
            FUA! implementa medidas razonables de seguridad para proteger la
            información personal de los usuarios. Sin embargo, ningún sistema
            es completamente seguro y no se puede garantizar una protección
            absoluta frente a accesos no autorizados.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-2">
            5. Derechos del usuario
          </h2>

          <p>Los usuarios podrán solicitar:</p>

          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li>El acceso a sus datos personales.</li>
            <li>La rectificación de información incorrecta.</li>
            <li>La eliminación de su cuenta y sus datos, cuando corresponda.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-2">
            6. Cambios en esta política
          </h2>

          <p>
            FUA! podrá actualizar esta Política de Privacidad en cualquier
            momento. Los cambios serán publicados en esta página y entrarán en
            vigencia desde su publicación.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-2">
            7. Contacto
          </h2>

          <p>
            Para consultas relacionadas con privacidad o protección de datos,
            podés comunicarte con FUA! a través de los canales oficiales de
            contacto disponibles en la plataforma.
          </p>
        </section>
      </div>
    </main>
  )
}