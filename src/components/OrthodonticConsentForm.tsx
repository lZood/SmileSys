import React, { useState } from 'react';
import { X, FileText, CheckSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { SignaturePadComponent } from './SignaturePad';
import { useAuth } from '../hooks/useAuth';
import { jsPDF } from 'jspdf';

interface OrthodonticConsentFormProps {
  onClose: () => void;
  onSubmit: (data: any) => void;
  patientName: string;
}

export function OrthodonticConsentForm({ onClose, onSubmit, patientName }: OrthodonticConsentFormProps) {
  const { session } = useAuth();
  const [formData, setFormData] = useState({
    treatment: '',
    duration: '',
    totalCost: '',
    monthlyPayment: '',
    acceptsTerms: false,
    patientSignature: '',
    doctorSignature: ''
  });
  const [showSignaturePad, setShowSignaturePad] = useState<'patient' | 'doctor' | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    const maxWidth = pageWidth - (margin * 2);
    const currentDate = new Date().toLocaleDateString();
    let yPosition = 20;

    // Add clinic logo/header
    doc.setFontSize(20);
    doc.text('DentalCare', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    doc.setFontSize(16);
    doc.text('Consentimiento Informado - Tratamiento de Ortodoncia', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;

    // Patient information
    doc.setFontSize(12);
    doc.text(`Fecha: ${currentDate}`, margin, yPosition);
    yPosition += 10;
    doc.text(`Paciente: ${patientName}`, margin, yPosition);
    yPosition += 20;

    // Treatment details
    doc.text('DETALLES DEL TRATAMIENTO', margin, yPosition);
    yPosition += 10;
    doc.text(`Tratamiento: ${formData.treatment}`, margin, yPosition);
    yPosition += 10;
    doc.text(`Duración estimada: ${formData.duration}`, margin, yPosition);
    yPosition += 10;
    doc.text(`Costo total: $${formData.totalCost}`, margin, yPosition);
    yPosition += 10;
    doc.text(`Pago mensual: $${formData.monthlyPayment}`, margin, yPosition);
    yPosition += 20;

    // Línea divisoria antes de las firmas
    doc.setDrawColor(100, 100, 100);
    doc.line(margin, yPosition - 10, pageWidth - margin, yPosition - 10);
    yPosition += 10;

    // Add signatures
    const signatureWidth = 70;
    const signatureHeight = 30;
    const leftSignatureX = margin + 20;
    const rightSignatureX = pageWidth - margin - signatureWidth - 20;

    if (formData.patientSignature) {
      doc.addImage(formData.patientSignature, 'PNG', leftSignatureX, yPosition, signatureWidth, signatureHeight);
      doc.setFontSize(10);
      doc.text('Firma del Paciente o Tutor', leftSignatureX + signatureWidth/2, yPosition + signatureHeight + 10, { align: 'center' });
      doc.text(patientName, leftSignatureX + signatureWidth/2, yPosition + signatureHeight + 20, { align: 'center' });
    }

    if (formData.doctorSignature) {
      doc.addImage(formData.doctorSignature, 'PNG', rightSignatureX, yPosition, signatureWidth, signatureHeight);
      doc.setFontSize(10);
      doc.text('Firma del Doctor', rightSignatureX + signatureWidth/2, yPosition + signatureHeight + 10, { align: 'center' });
      // Obtener el email del doctor de la sesión
      const doctorEmail = session?.user?.email || 'Doctor';
      doc.text(doctorEmail, rightSignatureX + signatureWidth/2, yPosition + signatureHeight + 20, { align: 'center' });
    }
    
    // Add extra space after signatures
    yPosition += signatureHeight + 40;

    // Add dividing line after signatures
    doc.setDrawColor(100, 100, 100);
    doc.line(margin, yPosition - 10, pageWidth - margin, yPosition - 10);
    yPosition += 20;

    // Terms and conditions
    doc.addPage();
    yPosition = margin;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('TÉRMINOS Y CONDICIONES', margin, yPosition);
    yPosition += 15;

    // Subtítulos y contenido
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    
    const sections = [
  {
    title: 'Riesgos y limitaciones para el tratamiento de Ortodoncia',
    content: [
      'El éxito de un Tratamiento de Ortodoncia es una asociación entre el Ortodoncista y el Paciente. El médico y el personal están dedicados a lograr el mejor resultado posible para cada paciente.',
      'Como regla general, los pacientes informados y de cooperación pueden lograr resultados positivos de ortodoncia.',
      'Sin dejar de reconocer los beneficios de una sonrisa hermosa y saludable, también debe ser consciente de que, al igual que con todas las artes de la curación, el tratamiento de ortodoncia tiene limitaciones y riesgos potenciales.',
      'Estos son rara vez lo suficientemente graves como para indicar que no debe tener tratamiento, sin embargo, todos los pacientes deben considerar seriamente la opción de no tratamiento de ortodoncia en absoluto por la aceptación de su condición oral.',
      'Las alternativas al tratamiento de ortodoncia varían con problemas específicos de la persona, y las soluciones protésicas o el tratamiento ortodóncico limitado pueden tener consideraciones.',
      'Se le anima a discutir alternativas con el médico antes de comenzar el tratamiento.',
      'Ortodoncia y Ortopedia dentofacial es la especialidad de la odontología que incluye el diagnóstico, la prevención, la intervención y la corrección de la mala oclusión, así como neuromusculares y anomalías esqueléticas del desarrollo o estructuras orto faciales maduras.',
      'Un Ortodoncista es un especialista dental que ha completado al menos dos años adicionales de formación de postgrado en ortodoncia en un programa acreditado después de la graduación de la escuela dental.'
    ]
  },
  {
    title: 'Resultados de Tratamiento',
    content: [
      'El tratamiento de ortodoncia por lo general avanza según lo previsto, y tenemos la intención de hacer todo lo posible para lograr los mejores resultados para todos los pacientes.',
      'Sin embargo, no podemos garantizar que usted estará completamente satisfecho con los resultados, ni se pueden anticipar todas las complicaciones o consecuencias.',
      'El éxito del tratamiento depende de su cooperación para cumplir con las citas, mantener una buena higiene bucal, evitando aparatos sueltos o rotos, y siguiendo las instrucciones del ortodoncista con cuidado.'
    ]
  },
  {
    title: 'Duración del Tratamiento',
    content: [
      'La duración del tratamiento depende de una serie de cuestiones, incluyendo la gravedad del problema, el crecimiento del paciente y el nivel de cooperación del paciente.',
      'El tiempo de tratamiento real es por lo general cercano al tiempo de tratamiento estimado, pero el tratamiento puede alargarse si, por ejemplo, se produce un crecimiento no anticipado, si hay hábitos que afectan a las estructuras dentofaciales, si se producen problemas dentales periodontales u otros, o si la cooperación del paciente no es adecuada.',
      'Por lo tanto, los cambios en el plan de tratamiento inicial pueden llegar a ser necesarios.',
      'Si el tiempo de tratamiento se extiende más allá de la estimación original, los honorarios adicionales pueden ser evaluados.'
    ]
  },
  {
    title: 'Malestar',
    content: [
      'La boca es muy sensible por lo que puede esperar un período de adaptación y algo de molestia debido a la introducción de los aparatos de ortodoncia. Medicamentos para el dolor de venta libre puede utilizarse durante este período de ajuste.',
    ]
  },
  {
    title: 'Reincidencia  ',
    content: [
      'Completado el tratamiento de ortodoncia no garantiza dientes perfectamente rectos para el resto de su vida. Se requerirá retenedores para mantener sus dientes en sus nuevas posiciones como resultado de su tratamiento Ortodoncia. Usted tiene que usar sus retenedores según las instrucciones o los dientes pueden cambiar, además de otros efectos adversos. Desgaste de retención regular es a menudo necesario durante varios años después de un tratamiento de ortodoncia. Sin embargo, los cambios después de que rime pueden ocurrir debido a causas naturales, incluidas los hábitos tales como sacar la lengua, respiración por la boca, y el crecimiento y la maduración que continúan durante toda la vida. Más tarde en la vida, la mayoría de la gente va a ver a sus tu dientes moverse. Irregularidades de menor  importancia, en particular en los dientes frontales inferiores, pueden tener que ser aceptado. Algunos cambios pueden requerir un tratamiento adicional de ortodoncia o  en algunos casos, la cirugía. Algunas situaciones pueden requerir retenedores no extraíbles  u otros aparatos dentales hechas por su (dentista  familiar).',
    ]
  },
  {
    title: 'Extracciones',
    content: [
      'Algunos casos requerirán la remoción de dientes deciduos (dientes de leche) o dientes permanentes. Existen riesgos adicionales asociados con la extracción de dientes que usted debe discutir con su dentista  familiar o cirujano oral antes del procedimiento.',
    ]
  },
  {
    title: 'La cirugía ortognática',
    content: [
      'Algunos pacientes presentan desarmonías esqueléticas significativas que requieren tratamiento de ortodoncia en conjunción con la cirugía ortognática (dentofacial). Existen riesgos adicionales asociados con este tipo de cirugía que usted debe discutir con su Cirujano maxilofacial.',
      'Antes de comenzar el tratamiento de ortodoncia. Tenga en cuenta que el tratamiento de ortodoncia antes de la cirugía ortognática  a  menudo sólo alinea los dientes dentro del individuo  arcadas dentarias. Por lo tanto, los pacientes que interrumpieron el tratamiento de ortodoncia sin completar los procedimientos quirúrgicos previstos pueden tener una mala oclusión que es peor que cuando comenzaron  tratamiento.'
    ]
  },
  {
    title: 'Descalcificación y Caries Dental',
    content: [
      'Excelente higiene oral es esencial durante el tratamiento de ortodoncia',
      'Como son las visitas periódicas a su dentista lo familiar. Higiene inadecuada o incorrecta puede causar caries, los dientes descoloridos, enfermedad periodontal y / o descalcificación. Estos mismos problemas pueden ocurrir sin tratamiento de ortodoncia, pero el riesgo es mayor para un individuo  usando  brackets u otros aparatos. Estos problemas pueden agravarse si el paciente no ha tenido el beneficio de agua fluorada o su sustituto, o si el paciente consume bebidas o alimentos endulzados.'
    ]
  },
  {
    title: 'La reabsorción radicular ',
    content: [
      'Las raíces de los dientes de algunos pacientes se hacen más cortos (resorción) durante el tratamiento de ortodoncia. No se sabe exactamente qué causa la reabsorción de la raíz, y tampoco es posible predecir qué pacientes van a experimentar. Sin embargo, muchos pacientes han conservado los dientes durante toda la vida con raíces severamente recortadas. Si se detecta la resorción durante el tratamiento de ortodoncia, su ortodoncista le recomiende una pausa en el tratamiento o la eliminación de los aparatos antes de la finalización del tratamiento de ortodoncia.',
    ]
  },
  {
    title: 'Daño al Nervio',
    content: [
      'Un diente que ha sido traumatizado por un accidente o una caries profunda puede tener daños experimentados en el nervio de la raíz. Movimiento dental ortodóncico puede, en algunos casos, agravar esta condición. En algunos casos, puede ser necesario un tratamiento de conducto. En los casos graves, el diente o los dientes se pueden perder.',
    ]
  },
  {
    title: 'Enfermedad Periodontal',
    content: [
      'Periodontal (de las encías y el hueso ) la enfermedad se puede desarrollar o empeorar durante el tratamiento ortodóncico debido a muchos factores , pero más a menudo debido a la falta de higiene bucal adecuada. Usted debe atender a su dentista general o si está indicado, un periodoncista vigilar su salud periodontal durante el tratamiento de ortodoncia cada tres a seis meses. Si los problemas periodontales no pueden ser controlados, el tratamiento ortopédico puede tener que ser suspendido antes de su finalización.',
    ]
  },
  {
    title: 'Lesión de aparatos ortodónticos',
    content: [
      'Actividades o alimentos que puedan dañar, aflojar o desalojar a los aparatos de ortodoncia deben ser evitados. Aparatos de ortodoncia flojos o dañados pueden ser inhaladas o tragadas o podrían causar otros daños en el paciente. Usted debe informar a su ortodoncista de cualquier síntoma inusual o de cualquier aparato suelto o roto en cuanto se notan. Daños en el esmalte de un diente o una restauración (corona, resina, carilla, etc.) es posible cuando se quitan los aparatos de ortodoncia. Este problema puede ser más probable cuando la estética (claro o del color del diente) aparatos han sido seleccionados. Si el daño se produce a un diente o la restauración, Su dentista deberá restaurar  las raíces / dientes afectados,',
    ]
  },
  {
    title: 'Arco extraoral',
    content: [
      'Arco extraoral en la ortodoncia pueden causar lesiones al paciente. Las lesiones pueden incluir daño en la cara o los ojos. Especialmente, una lesión en el ojo, ayuda médica aunque sea menor, inmediatamente se debe buscar. Abstenerse de usarlo en las situaciones en que puede haber una posibilidad de que podría ser desalojado o jalado. Las actividades deportivas y juegos deben evitarse al usar arco extraoral de ortodoncia.',
    ]
  },
  {
    title: 'Temporomandibular (la mandíbula) Disfunción de la Articulación',
    content: [
      'Pueden surgir problemas en las articulaciones de la mandíbula, es decir, las articulaciones temporomandibulares (ATM), lo que provoca dolor, dolores de cabeza o problemas de oído. Hay muchos factores que pueden afectar  la salud de las articulaciones de la mandíbula, incluyendo traumas pasados (golpes en la cabeza o de la cara), la artritis, la tendencia hereditaria a la mandíbula problemas en las articulaciones,  rechinar o apretar  los  dientes, mordedura mal balanceada y que muchas de las condiciones médicas. Problemas de articulación de la mandíbula pueden ocurrir con o sin tratamiento de ortodoncia. Cualquier síntomas articulares de la mandíbula, incluyendo el dolor, la mandíbula truena o dificultad para abrir o cerrar, debería notificarse sin demora al ortodoncista. El tratamiento de otros especialistas médicos o dentales puede ser necesario.',
    ]
  },
  {
    title: 'Impactados, cerrado, dientes anquilosados',
    content: [
      'Los dientes pueden llegar a ser afectados (atrapado debajo del hueso o de las encías), anquilosado (fusionado con el hueso) o simplemente dejar de entrar en erupción. A menudo, estas condiciones ocurren sin razón aparente y, en general, no se pueden anticipar. El tratamiento de estas condiciones depende de la circunstancia particular y la importancia global de la boca, y puede requerir la extracción, la exposición quirúrgica, el trasplante quirúrgico o sustitución protésica.',
    ]
  },
  {
    title: 'Ajuste oclusal',
    content: [
      'Usted puede esperar que las imperfecciones mínimas en la forma en que sus dientes se encuentran a partir del final del tratamiento. Un procedimiento de equilibrio oclusal puede ser necesario, que es un método de desgaste se utiliza para ajustar la oclusión. También puede ser necesario extraer una pequeña cantidad de esmalte entre los dientes; de ese modo " aplanar " en superficies mayores para reducir la posibilidad de una reincidencia.',
    ]
  },
  {
    title: 'Resultados no ideal',
    content: [
      'Debido a la amplia variación en el tamaño y la forma de los dientes, dientes ausentes, etc., la consecución de un resultado ideal (por ejemplo, el cierre completo de un espacio) puede no ser posible. Tratamiento dental restaurativa, como unión estética, coronas o puentes o la terapia periodontal, puede ser indicada. Se le recomienda que consulte a su ortodoncista y dentista de la familia sobre el cuidado complementario.',
    ]
  },
  {
    title: 'Los terceros molares',
    content: [
      'Como los terceros molares (muelas del juicio) se desarrollan, sus dientes pueden cambiar la alineación. Su dentista y / u ortodoncista deben vigilar con el fin de determinar cuándo y si los terceros molares deben ser eliminados.',
    ]
  },
  {
    title: 'Alergias ',
    content: [
      'Ocasionalmente, los pacientes pueden ser alérgicos a algunos de los materiales de los componentes de sus aparatos de ortodoncia. Esto puede requerir un cambio en el plan de tratamiento o interrupción del tratamiento antes de su finalización, aunque es muy poco frecuente, el tratamiento médico de las alergias materiales dentales puede ser necesario.',
    ]
  },
  {
    title: 'Problemas de Salud General',
    content: [
      'Problemas de salud generales, como los huesos, la sangre o los trastornos endocrinos, y muchos de prescripción y de medicamentos sin receta médica (Incluyendo los bifosfonatos) puede afectar su tratamiento de ortodoncia. Es imperativo que informe a su ortodoncista de cualquier cambio en su estado de salud general.',
    ]
  },
  {
    title: 'El uso de productos de tabaco',
    content: [
      'Fumar o masticar tabaco se ha demostrado que aumenta el riesgo de enfermedad de las encías e interfiere con la recuperación después de la cirugía oral. Los consumidores de tabaco son más propensos al cáncer oral, recesión de las encías, y el movimiento dental retardada durante el tratamiento ortodóncico. Si usted fuma, usted debe considerar cuidadosamente la posibilidad de un resultado ortodóntico comprometida.',
    ]
  },
  {
    title: 'Anclaje dispositivos temporales',
    content: [
      'Su tratamiento puede incluir el uso de un dispositivo de anclaje temporal (s) (es decir, el tornillo de metal o placa adherida al hueso.) Existen riesgos específicos asociados con ellos.',
      'Es posible que el tornillo (s) podría aflojarse lo que requeriría su / su eliminación y, posiblemente, la reubicación o el reemplazo con un tornillo más grande. El tornillo y el material conexo pueden tragarse accidentalmente. Si el dispositivo no puede estabilizarse por un período de tiempo adecuado, un plan de tratamiento alternativo puede ser necesario.',
      'Es posible que el tejido alrededor del dispositivo podría inflamarse o infectarse, o el tejido blando podría crecer sobre el dispositivo, que también podría requerir su extracción, la excisión quirúrgica del tejido y / o el uso de antibióticos o enjuagues antimicrobianos.',
      'Es posible que los tornillos pueden romper (es decir, tras la inserción o extracción.) Si esto ocurre, la pieza rota se puede dejar en la boca o se puede extirpar quirúrgicamente. Esto puede requerir la remisión a otro especialista dental.',
      'Al insertar el dispositivo (s), es posible dañar la raíz de un diente, un nervio, o  perforar el seno maxilar. Por lo general, estos problemas no son significativas, sin embargo, puede ser necesario un tratamiento médico o dental adicional.',
      'La anestesia local se puede utilizar cuando se insertan o se eliminan estos dispositivos, que también tiene riesgos. Informe al médico al colocar el dispositivo si ha tenido alguna dificultad con anestésicos negación en el pasado.',
      'Si alguna de las complicaciones antes mencionadas ocurre el paciente puede ser referido a  su dentista de la familia u otro especialista dental o médico para recibir tratamiento adicional, los honorarios por estos servicios no están incluidos en el costo del tratamiento de ortodoncia.',
    ]
  },
  {
    title: 'RECONOCIMIENTO  ',
    content: [
      'Por la presente declaro que he leído y entiendo plenamente las consideraciones de tratamiento y los riesgos que se presentan en este formulario. También entiendo que puede haber otros problemas que ocurren con menos frecuencia que las que se presentan, y que los resultados reales pueden diferir de los resultados anticipados. También reconozco que he discutido esta forma con el ortodoncista firmante (s) y ha dado la oportunidad de formular las preguntas. Se me ha pedido  tomar una decisión acerca de mi tratamiento. Doy mi consentimiento para el tratamiento propuesto y autorizo al ortodoncista (s) que se indica a continuación para proporcionar el tratamiento. También autorizo al ortodoncista (s)  proporcionar mi información de salud para mis otros proveedores de atención médica. Entiendo que los honorarios del tratamiento abarcan solamente las prestaciones efectuadas por el ortodoncista (s), y que el tratamiento proporcionado por otros profesionales médicos o dentales no está incluido en la tarifa de mi tratamiento de ortodoncia. ',
    ]
  },
  {
    title: 'CONSENTIMIENTO PARA SOMETERSE A TRATAMIENTO DE ORTOPEDIA',
    content: [
      'Doy mi consentimiento para la realización de los registros de diagnóstico , incluyendo radiografías , antes, durante y después de un tratamiento de ortodoncia , por el Ortodoncista arriba mencionado ( s ) y , en su caso , por el personal que proporciona un tratamiento de ortodoncia prescrito por el Ortodoncista arriba mencionado ( s ) para el paciente arriba mencionado . Entiendo completamente todos los riesgos asociados con el tratamiento.',
    ]
  },
  {
    title: 'AUTORIZACIÓN PARA LIBERACION DE INFORMACIÓN DEL PACIENTE',
    content: [
      'Por la presente autorizo al Ortodoncista',
      'Arriba mencionado (s) que preste a  otros proveedores de cuidado de la salud con información sobre el tratamiento de ortodoncia del paciente  cuando se considere apropiado. Entiendo que una vez liberado, el médico (s) anterior y el personal  no se responsabilizan de cualquier liberación aún más por la persona que recibe esta información.',
    ]
  }, 
  {
    title: 'CONSENTIMIENTO PARA EL USO DE LOS REGISTROS',
    content: [
      'Yo doy mi permiso para el uso de los registros de ortodoncia, incluyendo fotografías, realizadas en el proceso de los exámenes, el tratamiento y la retención a efectos de consultas profesionales, la investigación, la educación o la publicación en revistas profesionales.',
      'Los pagos por consulta de ajuste mensual serán Obligatorios y consecutivos de inicio a fin del tratamiento, obligándose al paciente a realizar los pagos de manera puntual al presentarse a cada consulta o activación antes de pasar a la misma.',
      'Los pagos a que se refieren los párrafos que anteceden, NO incluyen ningún otro tipo de servicio que sea necesario durante el tratamiento de ortodoncia. Como por ejemplo: modelos de estudio, reposición y re cementación de brackets, aparatos ortodonticos o terapéuticos, limpiezas, blanqueamientos, resinas, extracciones, etc.',
      'Expuesto lo anterior y reconociéndose mutuamente la personalidad con la cual comparecen ambas partes para la formulación de este instrumento, se otorgan las siguientes CLAUSULAS:',
      'Primera: El paciente se compromete a cumplir sus responsabilidades en cuanto al cuidado de los aparatos, prestar cooperación e higiene bucal absoluta, asistencia puntual a sus citas, uso apropiado de aditamentos.',
      'Segunda: No deberá el paciente romper, retirar o mover sus aparatos, ni deberá tener hábitos perjudiciales que dañen sus dientes. Así como de tener el cuidado de no morder o ingerir alimentos demasiado duros durante todo el tratamiento, de los cuales aquí se hace referencia a algunos de ellos: manzana, caña, zanahoria, apio, o cualquier fruta o vegetal crudo o deshidratado que no estén cortados en pequeños pedazos. Queda estrictamente prohibidos los caramelos, elotes, doritos, fritos, tostadas, pretzels, chicles, caramelos ,cacahuates, taquitos dorados, masticar hielo y NO Morder objetos como lápices, plumas, ni morderse las uñas, chuparse  el dedo, morderse labios o lengua, entre otras.',
      'ercera: El paciente acepta que el desarrollo del tratamiento de ortodoncia y resultado estará influenciado por la respuesta biológica de los tejidos, también y no menos importante por la constancia, compromiso y cuidados del paciente. Al remover los brackets se incide en factores de estabilidad como son: el tiempo de uso de los retenedores finales, presencia de terceros molares, hábitos perniciosos, memoria de los dientes, reacción de los tejidos, descuido de la salud bucal y estado general, caries, encías, crecimiento, función y cambios propios de la edad.',
      'Cuarta: El doctor se compromete a realizar el tratamiento descrito, observando siempre las más altas normas de calidad y eficiencia profesional que establece el código de ética que rige la especialidad de ortodoncia. Colocar cualquier aparato ortodontico necesario para lograr los objetivos mencionados.  Así como también atender al paciente debidamente durante sus citas programadas y/o extraordinarias que pudieran presentarse.',
      'Quinta: El paciente acepta el costo del tratamiento y la forma de realizarlo y se compromete a mantenerse al corriente en sus pagos de manera puntual, durante todo el tiempo que dure el tratamiento. Incluso en el supuesto de que el paciente no asista a uno de sus ajustes mensuales sin cancelación previa a 24 horas, tendrá que pagar una multa de $100.00 m.n. El paciente entiende y por ende se obliga a pagar el costo del tratamiento de ortodoncia en todas sus visitas mensuales sin excusa ni pretexto.',
      'También entiende que el costo de dicho tratamiento no incluye los retenedores finales, pérdida o ruptura de los aparatos, colocación de tubos, reposición y re cementación de brackets.',
      'Las consecuencias que su falta de interés pudieran ocasionar que el tratamiento dure más tiempo.',
      'Sexta: Si el paciente suspendiera temporalmente el tratamiento faltando a sus citas por causas de diversa índole, incluyendo la interrupción por falta del cumplimiento en los pagos pactados   (retraso en 3 sesiones) se hará responsable el mismo de las consecuencias que puedan presentarse. Incluso la  doctora  podrá optar por dar de baja el tratamiento de ortodoncia.  Si esto ocurriera el paciente o su tutor legal eximen a la doctora de toda responsabilidad, por ser un hecho atribuible al paciente.',
      'Séptima: Si se diera el caso mencionado en la cláusula anterior y el paciente decidiera reiniciarlo o retomarlo, deberá cubrir lo convenido al momento de hacerlo y se establecerán de común acuerdo nuevos honorarios para terminarlo.',
      'Octava: El paciente está consciente y conoce perfectamente los riesgos, limitaciones y posibles consecuencias que implica un tratamiento de ortodoncia que se lleve a cabo y da su consentimiento informado para realizarlo.',
      'Novena: Se le pedirá al paciente que se realice una segunda toma de radiografías cuando este cumpla el año con el tratamiento para el seguimiento del tratamiento, de igual forma al finalizar el tratamiento antes de retirar aparatología para asegurarse de la correcta posición de las articulaciones y posición de los órganos dentales.'
    ]
  }   
];

    sections.forEach(section => {
      // Verificar si necesitamos una nueva página
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = margin;
      }

      // Título de sección
      doc.setFont('helvetica', 'bold');
      doc.text(section.title, margin, yPosition);
      yPosition += 10;

      // Contenido de la sección
      doc.setFont('helvetica', 'normal');
      section.content.forEach(text => {
        // Dividir el texto en líneas que se ajusten al ancho máximo
        const lines = doc.splitTextToSize(text, maxWidth - 10);
        
        lines.forEach(line => {
          // Verificar si necesitamos una nueva página
          if (yPosition > pageHeight - 40) {
            doc.addPage();
            yPosition = margin;
          }
          doc.text(line, margin + 5, yPosition);
          yPosition += 6;
        });
        yPosition += 4;
      });
      yPosition += 10; // Espacio extra entre secciones
    });

    return doc;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.treatment.trim()) {
      newErrors.treatment = 'El tratamiento es requerido';
    }
    if (!formData.duration.trim()) {
      newErrors.duration = 'La duración es requerida';
    }
    if (!formData.totalCost.trim()) {
      newErrors.totalCost = 'El costo total es requerido';
    }
    if (!formData.monthlyPayment.trim()) {
      newErrors.monthlyPayment = 'El pago mensual es requerido';
    }
    if (!formData.patientSignature) {
      newErrors.patientSignature = 'Se requiere la firma del paciente';
    }
    if (!formData.doctorSignature) {
      newErrors.doctorSignature = 'Se requiere la firma del doctor';
    }
    if (!formData.acceptsTerms) {
      newErrors.acceptsTerms = 'Debe aceptar los términos y condiciones';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!session?.user) {
        throw new Error('No authenticated user');
      }

      // Validate form first
      if (!validateForm()) {
        return;
      }

      // Generate PDF
      const doc = generatePDF();
      const pdfBlob = doc.output('blob');
      const fileName = `consent_${Date.now()}.pdf`;

      // Ensure storage bucket exists
      const { data: bucketData, error: bucketError } = await supabase
        .storage
        .getBucket('orthodontic-consents');

      if (bucketError && bucketError.message.includes('does not exist')) {
        const { error: createBucketError } = await supabase
          .storage
          .createBucket('orthodontic-consents', { public: true });

        if (createBucketError) {
          throw new Error(`Error creating storage bucket: ${createBucketError.message}`);
        }
      }

      // Upload PDF to Supabase Storage
      const { data: storageData, error: storageError } = await supabase.storage
        .from('orthodontic-consents')
        .upload(fileName, pdfBlob, {
          contentType: 'application/pdf',
          upsert: true
        });

      if (storageError) {
        throw new Error(`Error uploading PDF: ${storageError.message}`);
      }

      // Get the public URL of the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('orthodontic-consents')
        .getPublicUrl(fileName);

      if (!publicUrl) {
        throw new Error('Failed to get public URL for uploaded PDF');
      }

      // Save consent form data to Supabase
      const { data: consentData, error: consentError } = await supabase
        .from('orthodontic_consents')
        .insert([{
          patient_name: patientName,
          treatment: formData.treatment,
          duration: formData.duration,
          total_cost: parseFloat(formData.totalCost),
          monthly_payment: parseFloat(formData.monthlyPayment),
          pdf_url: publicUrl,
          accepted_terms: true,
          status: 'pending_signature'
        }])
        .select()
        .single();

      if (consentError) throw consentError;

      if (consentData) {
        onSubmit(consentData);
        onClose();
      } else {
        throw new Error('Failed to create consent record');
      }

    } catch (error) {
      console.error('Error saving consent form:', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const handleSignatureSave = (signatureData: string) => {
    if (showSignaturePad === 'patient') {
      setFormData(prev => ({ ...prev, patientSignature: signatureData }));
    } else if (showSignaturePad === 'doctor') {
      setFormData(prev => ({ ...prev, doctorSignature: signatureData }));
    }
    setShowSignaturePad(null);
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Consentimiento Informado - Ortodoncia</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto overflow-x-auto pr-2 max-h-[calc(90vh-200px)]">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tratamiento
                </label>
                <input
                  type="text"
                  name="treatment"
                  value={formData.treatment}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Brackets metálicos"
                />
                {errors.treatment && (
                  <p className="mt-1 text-sm text-red-600">{errors.treatment}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duración Estimada
                </label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: 24 meses"
                />
                {errors.duration && (
                  <p className="mt-1 text-sm text-red-600">{errors.duration}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Costo Total
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    name="totalCost"
                    value={formData.totalCost}
                    onChange={handleChange}
                    className="w-full pl-8 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
                {errors.totalCost && (
                  <p className="mt-1 text-sm text-red-600">{errors.totalCost}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pago Mensual
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    name="monthlyPayment"
                    value={formData.monthlyPayment}
                    onChange={handleChange}
                    className="w-full pl-8 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
                {errors.monthlyPayment && (
                  <p className="mt-1 text-sm text-red-600">{errors.monthlyPayment}</p>
                )}
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-4">Términos y Condiciones</h3>
              <div className="space-y-4 text-sm text-gray-600 max-h-96 overflow-y-auto p-4">
                <h4 className="font-medium text-gray-900">Riesgos y limitaciones para el tratamiento de Ortodoncia</h4>
                <p>1. El éxito de un Tratamiento de Ortodoncia es una asociación entre el Ortodoncista y el Paciente. El médico y el personal están dedicados a lograr el mejor resultado posible para cada paciente. Como regla general, los pacientes informados y de cooperación pueden lograr resultados positivos de ortodoncia. Sin dejar de reconocer los beneficios de una sonrisa hermosa y saludable, también debe ser consciente de que, al igual que con todas las artes de la curación, el tratamiento de ortodoncia tiene limitaciones y riesgos potenciales. Estos son rara vez lo suficientemente grave como para indicar que no debe.</p>
                <p>Tener tratamiento, sin embargo, todos los pacientes deben considerar seriamente la opción de no tratamiento de ortodoncia en absoluto por la aceptación de su condición oral. Alternativas al tratamiento de ortodoncia varían con problemas específicos de la persona, y las soluciones protésicas.</p>
                <p>O el tratamiento Ortodóncico limitado puede tener consideraciones. Se le anima a discutir alternativas con el médico antes de comenzar el tratamiento.</p>
                <p>Ortodoncia y Ortopedia dentofacial es la especialidad de la odontología que incluye el diagnóstico, la prevención, la intervención y la corrección de la mala oclusión, así como neuromusculares y anomalías esqueléticas del desarrollo o estructuras orto faciales maduras.</p>
                <p>Un Ortodoncista, es un especialista dental que ha completado al menos dos años adicionales de formación de postgrado en ortodoncia en un programa acreditado después de la graduación de la escuela dental.</p>
                
                <h4 className="font-medium text-gray-900 mt-6">Resultados de Tratamiento</h4>
                <p>El tratamiento de ortodoncia por lo general avanza según lo previsto, y tenemos la intención de hacer todo lo posible para lograr los mejores resultados para todos los pacientes. Sin embargo, no podemos garantizar que usted estará completamente satisfecho con los resultados, ni se puede anticipar todas las complicaciones o consecuencias. El éxito del tratamiento depende de su cooperación para cumplir con las citas, mantener una buena higiene bucal, evitando aparatos sueltos o rotos, y siguiendo las instrucciones del ortodoncista con cuidado.</p>

                <h4 className="font-medium text-gray-900 mt-6">Duración del Tratamiento</h4>
                <p>La duración del tratamiento depende de una serie de cuestiones, incluyendo la gravedad del problema, el crecimiento del paciente y el nivel de la cooperación del paciente. El tiempo de tratamiento real es por lo general la dosis para el tiempo de tratamiento estimado, pero el tratamiento puede alargarse si, por ejemplo, se produce un crecimiento no anticipado, si hay hábitos que afectan a las estructuras dentofacial, si se producen problemas dentales periodontales u otros, o si la cooperación del paciente no es adecuada. Por lo tanto, los cambios en el plan de tratamiento inicial pueden llegar a ser necesario. Si el tiempo de tratamiento se extiende más allá de la estimación original, los honorarios adicionales pueden ser evaluados.</p>

                <h4 className="font-medium text-gray-900 mt-6">Malestar</h4>
                <p>La boca es muy sensible por lo que puede esperar un período de adaptación y algo de molestia debido a la introducción de los aparatos de ortodoncia. Medicamentos para el dolor de venta libre puede utilizarse durante este período de ajuste.</p>
                
                <h4 className="font-medium text-gray-900 mt-6">Reincidencia</h4>
                <p>Completado el tratamiento de ortodoncia no garantiza dientes perfectamente rectos para el resto de su vida. Se requerirá retenedores para mantener sus dientes en sus nuevas posiciones como resultado de su tratamiento Ortodoncia. Usted tiene que usar sus retenedores según las instrucciones o los dientes pueden cambiar, además de otros efectos adversos. Desgaste de retención regular es a menudo necesario durante varios años después de un tratamiento de ortodoncia. Sin embargo, los cambios después de que rime pueden ocurrir debido a causas naturales, incluidas los hábitos tales como sacar la lengua, respiración por la boca, y el crecimiento y la maduración que continúan durante toda la vida. Más tarde en la vida, la mayoría de la gente va a ver a sus tu dientes moverse. Irregularidades de menor  importancia, en particular en los dientes frontales inferiores, pueden tener que ser aceptado. Algunos cambios pueden requerir un tratamiento adicional de ortodoncia o  en algunos casos, la cirugía. Algunas situaciones pueden requerir retenedores no extraíbles  u otros aparatos dentales hechas por su (dentista  familiar).</p>

                <h4 className="font-medium text-gray-900 mt-6">Extracciones</h4>
                <p>Algunos casos requerirán la remoción de dientes deciduos (dientes de leche) o dientes permanentes. Existen riesgos adicionales asociados con la extracción de dientes que usted debe discutir con su dentista  familiar o cirujano oral antes del procedimiento.</p>

                <h4 className="font-medium text-gray-900 mt-6">La cirugía ortognática</h4>
                <p>Algunos pacientes presentan desarmonías esqueléticas significativas que requieren tratamiento de ortodoncia en conjunción con la cirugía ortognática (dentofacial). Existen riesgos adicionales asociados con este tipo de cirugía que usted debe discutir con su Cirujano maxilofacial.</p>

                <p>Antes de comenzar el tratamiento de ortodoncia. Tenga en cuenta que el tratamiento de ortodoncia antes de la cirugía ortognática  a  menudo sólo alinea los dientes dentro del individuo  arcadas dentarias. Por lo tanto, los pacientes que interrumpieron el tratamiento de ortodoncia sin completar los procedimientos quirúrgicos previstos pueden tener una mala oclusión que es peor que cuando comenzaron  tratamiento.</p>

                <h4 className="font-medium text-gray-900 mt-6">Descalcificación y Caries Dental</h4>
                <p>Excelente higiene oral es esencial durante el tratamiento de ortodoncia</p>
                <p>Como son las visitas periódicas a su dentista lo familiar. Higiene inadecuada o incorrecta puede causar caries, los dientes descoloridos, enfermedad periodontal y / o descalcificación. Estos mismos problemas pueden ocurrir sin tratamiento de ortodoncia, pero el riesgo es mayor para un individuo  usando  brackets u otros aparatos. Estos problemas pueden agravarse si el paciente no ha tenido el beneficio de agua fluorada o su sustituto, o si el paciente consume bebidas o alimentos endulzados.</p>

                <h4 className="font-medium text-gray-900 mt-6">La reabsorción radicular</h4>
                <p>Las raíces de los dientes de algunos pacientes se hacen más cortos (resorción) durante el tratamiento de ortodoncia. No se sabe exactamente qué causa la reabsorción de la raíz, y tampoco es posible predecir qué pacientes van a experimentar. Sin embargo, muchos pacientes han conservado los dientes durante toda la vida con raíces severamente recortadas. Si se detecta la resorción durante el tratamiento de ortodoncia, su ortodoncista le recomiende una pausa en el tratamiento o la eliminación de los aparatos antes de la finalización del tratamiento de ortodoncia.</p>

                <h4 className="font-medium text-gray-900 mt-6">Daño al Nervio</h4>
                <p>Un diente que ha sido traumatizado por un accidente o una caries profunda puede tener daños experimentados en el nervio de la raíz. Movimiento dental ortodóncico puede, en algunos casos, agravar esta condición. En algunos casos, puede ser necesario un tratamiento de conducto. En los casos graves, el diente o los dientes se pueden perder.</p>
                
                <h4 className="font-medium text-gray-900 mt-6">Enfermedad Periodonta</h4>
                <p>Periodontal (de las encías y el hueso ) la enfermedad se puede desarrollar o empeorar durante el tratamiento ortodóncico debido a muchos factores , pero más a menudo debido a la falta de higiene bucal adecuada. Usted debe atender a su dentista general o si está indicado, un periodoncista vigilar su salud periodontal durante el tratamiento de ortodoncia cada tres a seis meses. Si los problemas periodontales no pueden ser controlados, el tratamiento ortopédico puede tener que ser suspendido antes de su finalización.</p>

                <h4 className="font-medium text-gray-900 mt-6">Lesión de aparatos ortodónticos</h4>
                <p>Actividades o alimentos que puedan dañar, aflojar o desalojar a los aparatos de ortodoncia deben ser evitados. Aparatos de ortodoncia flojos o dañados pueden ser inhaladas o tragadas o podrían causar otros daños en el paciente. Usted debe informar a su ortodoncista de cualquier síntoma inusual o de cualquier aparato suelto o roto en cuanto se notan. Daños en el esmalte de un diente o una restauración (corona, resina, carilla, etc.) es posible cuando se quitan los aparatos de ortodoncia. Este problema puede ser más probable cuando la estética (claro o del color del diente) aparatos han sido seleccionados. Si el daño se produce a un diente o la restauración, Su dentista deberá restaurar  las raíces / dientes afectados.</p>

                <h4 className="font-medium text-gray-900 mt-6">Arco extraoral</h4>
                <p>Arco extraoral en la ortodoncia pueden causar lesiones al paciente. Las lesiones pueden incluir daño en la cara o los ojos. Especialmente, una lesión en el ojo, ayuda médica aunque sea menor, inmediatamente se debe buscar. Abstenerse de usarlo en las situaciones en que puede haber una posibilidad de que podría ser desalojado o jalado. Las actividades deportivas y juegos deben evitarse al usar arco extraoral de ortodoncia.</p>

                <h4 className="font-medium text-gray-900 mt-6">Temporomandibular (la mandíbula) Disfunción de la Articulación</h4>
                <p>Pueden surgir problemas en las articulaciones de la mandíbula, es decir, las articulaciones temporomandibulares (ATM), lo que provoca dolor, dolores de cabeza o problemas de oído. Hay muchos factores que pueden afectar  la salud de las articulaciones de la mandíbula, incluyendo traumas pasados (golpes en la cabeza o de la cara), la artritis, la tendencia hereditaria a la mandíbula problemas en las articulaciones,  rechinar o apretar  los  dientes, mordedura mal balanceada y que muchas de las condiciones médicas. Problemas de articulación de la mandíbula pueden ocurrir con o sin tratamiento de ortodoncia. Cualquier síntomas articulares de la mandíbula, incluyendo el dolor, la mandíbula truena o dificultad para abrir o cerrar, debería notificarse sin demora al ortodoncista. El tratamiento de otros especialistas médicos o dentales puede ser necesario,</p>

                <h4 className="font-medium text-gray-900 mt-6">Impactados, cerrado, dientes anquilosados</h4>
                <p>Los dientes pueden llegar a ser afectados (atrapado debajo del hueso o de las encías), anquilosado (fusionado con el hueso) o simplemente dejar de entrar en erupción. A menudo, estas condiciones ocurren sin razón aparente y, en general, no se pueden anticipar. El tratamiento de estas condiciones depende de la circunstancia particular y la importancia global de la boca, y puede requerir la extracción, la exposición quirúrgica, el trasplante quirúrgico o sustitución protésica.</p>

                <h4 className="font-medium text-gray-900 mt-6">Ajuste oclusal</h4>
                <p>Usted puede esperar que las imperfecciones mínimas en la forma en que sus dientes se encuentran a partir del final del tratamiento. Un procedimiento de equilibrio oclusal puede ser necesario, que es un método de desgaste se utiliza para ajustar la oclusión. También puede ser necesario extraer una pequeña cantidad de esmalte entre los dientes; de ese modo " aplanar " en superficies mayores para reducir la posibilidad de una reincidencia.</p>

                <h4 className="font-medium text-gray-900 mt-6">Resultados no ideal</h4>
                <p>Debido a la amplia variación en el tamaño y la forma de los dientes, dientes ausentes, etc., la consecución de un resultado ideal (por ejemplo, el cierre completo de un espacio) puede no ser posible. Tratamiento dental restaurativa, como unión estética, coronas o puentes o la terapia periodontal, puede ser indicada. Se le recomienda que consulte a su ortodoncista y dentista de la familia sobre el cuidado complementario.</p>

                <h4 className="font-medium text-gray-900 mt-6">Los terceros molares</h4>
                <p>Como los terceros molares (muelas del juicio) se desarrollan, sus dientes pueden cambiar la alineación. Su dentista y / u ortodoncista deben vigilar con el fin de determinar cuándo y si los terceros molares deben ser eliminados.</p>

                <h4 className="font-medium text-gray-900 mt-6">Alergias</h4>
                <p>Ocasionalmente, los pacientes pueden ser alérgicos a algunos de los materiales de los componentes de sus aparatos de ortodoncia. Esto puede requerir un cambio en el plan de tratamiento o interrupción del tratamiento antes de su finalización, aunque es muy poco frecuente, el tratamiento médico de las alergias materiales dentales puede ser necesario.</p>
                
                <h4 className="font-medium text-gray-900 mt-6">Problemas de Salud General</h4>
                <p>Problemas de salud generales, como los huesos, la sangre o los trastornos endocrinos, y muchos de prescripción y de medicamentos sin receta médica (Incluyendo los bifosfonatos) puede afectar su tratamiento de ortodoncia. Es imperativo que informe a su ortodoncista de cualquier cambio en su estado de salud general.</p>

                <h4 className="font-medium text-gray-900 mt-6">El uso de productos de tabaco</h4>
                <p>Fumar o masticar tabaco se ha demostrado que aumenta el riesgo de enfermedad de las encías e interfiere con la recuperación después de la cirugía oral. Los consumidores de tabaco son más propensos al cáncer oral, recesión de las encías, y el movimiento dental retardada durante el tratamiento ortodóncico. Si usted fuma, usted debe considerar cuidadosamente la posibilidad de un resultado ortodóntico comprometida.</p>

                <h4 className="font-medium text-gray-900 mt-6">Anclaje dispositivos temporales</h4>
                <p>Su tratamiento puede incluir el uso de un dispositivo de anclaje temporal (s) (es decir, el tornillo de metal o placa adherida al hueso.) Existen riesgos específicos asociados con ellos,  

  

Es posible que el tornillo (s) podría aflojarse lo que requeriría su / su eliminación y, posiblemente, la reubicación o el reemplazo con un tornillo más grande. El tornillo y el material conexo pueden tragarse accidentalmente. Si el dispositivo no puede estabilizarse por un período de tiempo adecuado, un plan de tratamiento alternativo puede ser necesario.  

Es posible que el tejido alrededor del dispositivo podría inflamarse o infectarse, o el tejido blando podría crecer sobre el dispositivo, que también podría requerir su extracción, la excisión quirúrgica del tejido y / o el uso de antibióticos o enjuagues antimicrobianos.  

Es posible que los tornillos pueden romper (es decir, tras la inserción o extracción.) Si esto ocurre, la pieza rota se puede dejar en la boca o se puede extirpar quirúrgicamente. Esto puede requerir la remisión a otro especialista dental.  

Al insertar el dispositivo (s), es posible dañar la raíz de un diente, un nervio, o  perforar el seno maxilar. Por lo general, estos problemas no son significativas, sin embargo, puede ser necesario un tratamiento médico o dental adicional. 

La anestesia local se puede utilizar cuando se insertan o se eliminan estos dispositivos, que también tiene riesgos. Informe al médico al colocar el dispositivo si ha tenido alguna dificultad con anestésicos negación en el pasado.  

  

Si alguna de las complicaciones antes mencionadas ocurre el paciente puede ser referido a  su dentista de la familia u otro especialista dental o médico para recibir tratamiento adicional, los honorarios por estos servicios no están incluidos en el costo del tratamiento de ortodoncia. </p>
                {/* Continue with all the sections... */}
                
                <h4 className="font-medium text-gray-900 mt-6">RECONOCIMIENTO</h4>
                <p>Por la presente declaro que he leído y entiendo plenamente las consideraciones de tratamiento y los riesgos que se presentan en este formulario. También entiendo que puede haber otros problemas que ocurren con menos frecuencia que las que se presentan, y que los resultados reales pueden diferir de los resultados anticipados. También reconozco que he discutido esta forma con el ortodoncista firmante (s) y ha dado la oportunidad de formular las preguntas. Se me ha pedido tomar una decisión acerca de mi tratamiento. Doy mi consentimiento para el tratamiento propuesto y autorizo al ortodoncista (s) que se indica a continuación para proporcionar el tratamiento. También autorizo al ortodoncista (s)  proporcionar mi información de salud para mis otros proveedores de atención médica. Entiendo que los honorarios del tratamiento abarcan solamente las prestaciones efectuadas por el ortodoncista (s), y que el tratamiento proporcionado por otros profesionales médicos o dentales no está incluido en la tarifa de mi tratamiento de ortodoncia. </p>
                
                <h4 className="font-medium text-gray-900 mt-6">CONSENTIMIENTO PARA SOMETERSE A TRATAMIENTO DE ORTOPEDIA</h4>
                <p>Doy mi consentimiento para la realización de los registros de diagnóstico, incluyendo radiografías, antes, durante y después de un tratamiento de ortodoncia, por el Ortodoncista arriba mencionado (s) y, en su caso, por el personal que proporciona un tratamiento de ortodoncia prescrito por el Ortodoncista arriba mencionado (s) para el paciente arriba mencionado. Entiendo completamente todos los riesgos asociados con el tratamiento.</p>
                
                <h4 className="font-medium text-gray-900 mt-6">AUTORIZACIÓN PARA LIBERACION DE INFORMACIÓN DEL PACIENTE</h4>
                <p>Por la presente autorizo al Ortodoncista arriba mencionado (s) que preste a otros proveedores de cuidado de la salud con información sobre el tratamiento de ortodoncia del paciente cuando se considere apropiado. Entiendo que una vez liberado, el médico (s) anterior y el personal no se responsabilizan de cualquier liberación aún más por la persona que recibe esta información.</p>
                
                <h4 className="font-medium text-gray-900 mt-6">CONSENTIMIENTO PARA EL USO DE LOS REGISTROS</h4>
                <p>Yo doy mi permiso para el uso de los registros de ortodoncia, incluyendo fotografías, realizadas en el proceso de los exámenes, el tratamiento y la retención a efectos de consultas profesionales, la investigación, la educación o la publicación en revistas profesionales.</p>
                <p>Los pagos por consulta de ajuste mensual serán Obligatorios y consecutivos de inicio a fin del tratamiento, obligándose al paciente a realizar los pagos de manera puntual al presentarse a cada consulta o activación antes de pasar a la misma.</p>
                <p>Los pagos a que se refieren los párrafos que anteceden, NO incluyen ningún otro tipo de servicio que sea necesario durante el tratamiento de ortodoncia. Como por ejemplo: modelos de estudio, reposición y re cementación de brackets, aparatos ortodonticos o terapéuticos, limpiezas, blanqueamientos, resinas, extracciones, etc.</p>
                <p>Expuesto lo anterior y reconociéndose mutuamente la personalidad con la cual comparecen ambas partes para la formulación de este instrumento, se otorgan las siguientes CLAUSULAS:</p>
                <p>Primera: El paciente se compromete a cumplir sus responsabilidades en cuanto al cuidado de los aparatos, prestar cooperación e higiene bucal absoluta, asistencia puntual a sus citas, uso apropiado de aditamentos.</p>
                <p>Segunda: No deberá el paciente romper, retirar o mover sus aparatos, ni deberá tener hábitos perjudiciales que dañen sus dientes. Así como de tener el cuidado de no morder o ingerir alimentos demasiado duros durante todo el tratamiento, de los cuales aquí se hace referencia a algunos de ellos: manzana, caña, zanahoria, apio, o cualquier fruta o vegetal crudo o deshidratado que no estén cortados en pequeños pedazos. Queda estrictamente prohibidos los caramelos, elotes, doritos, fritos, tostadas, pretzels, chicles, caramelos ,cacahuates, taquitos dorados, masticar hielo y NO Morder objetos como lápices, plumas, ni morderse las uñas, chuparse  el dedo, morderse labios o lengua, entre otras.</p>
                <p>Tercera: El paciente acepta que el desarrollo del tratamiento de ortodoncia y resultado estará influenciado por la respuesta biológica de los tejidos, también y no menos importante por la constancia, compromiso y cuidados del paciente. Al remover los brackets se incide en factores de estabilidad como son: el tiempo de uso de los retenedores finales, presencia de terceros molares, hábitos perniciosos, memoria de los dientes, reacción de los tejidos, descuido de la salud bucal y estado general, caries, encías, crecimiento, función y cambios propios de la edad.</p>
                <p>Cuarta: El doctor se compromete a realizar el tratamiento descrito, observando siempre las más altas normas de calidad y eficiencia profesional que establece el código de ética que rige la especialidad de ortodoncia. Colocar cualquier aparato ortodontico necesario para lograr los objetivos mencionados.  Así como también atender al paciente debidamente durante sus citas programadas y/o extraordinarias que pudieran presentarse. </p>
                <p>Quinta: El paciente acepta el costo del tratamiento y la forma de realizarlo y se compromete a mantenerse al corriente en sus pagos de manera puntual, durante todo el tiempo que dure el tratamiento. Incluso en el supuesto de que el paciente no asista a uno de sus ajustes mensuales sin cancelación previa a 24 horas, tendrá que pagar una multa de $100.00 m.n. El paciente entiende y por ende se obliga a pagar el costo del tratamiento de ortodoncia en todas sus visitas mensuales sin excusa ni pretexto.</p>
                <p>También entiende que el costo de dicho tratamiento no incluye los retenedores finales, pérdida o ruptura de los aparatos, colocación de tubos, reposición y re cementación de brackets.</p>
                <p>Las consecuencias que su falta de interés pudieran ocasionar que el tratamiento dure más tiempo.</p>
                <p>Sexta: Si el paciente suspendiera temporalmente el tratamiento faltando a sus citas por causas de diversa índole, incluyendo la interrupción por falta del cumplimiento en los pagos pactados   (retraso en 3 sesiones) se hará responsable el mismo de las consecuencias que puedan presentarse. Incluso la  doctora  podrá optar por dar de baja el tratamiento de ortodoncia.  Si esto ocurriera el paciente o su tutor legal eximen a la doctora de toda responsabilidad, por ser un hecho atribuible al paciente.</p>
                <p>Séptima: Si se diera el caso mencionado en la cláusula anterior y el paciente decidiera reiniciarlo o retomarlo, deberá cubrir lo convenido al momento de hacerlo y se establecerán de común acuerdo nuevos honorarios para terminarlo.</p>
                <p>Octava: El paciente está consciente y conoce perfectamente los riesgos, limitaciones y posibles consecuencias que implica un tratamiento de ortodoncia que se lleve a cabo y da su consentimiento informado para realizarlo.</p>
                <p>Novena: Se le pedirá al paciente que se realice una segunda toma de radiografías cuando este cumpla el año con el tratamiento para el seguimiento del tratamiento, de igual forma al finalizar el tratamiento antes de retirar aparatología para asegurarse de la correcta posición de las articulaciones y posición de los órganos dentales. </p>
                
              </div>
            </div>

            {/* Signatures */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Firmas</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Firma del Paciente</p>
                  {formData.patientSignature ? (
                    <div className="relative">
                      <img
                        src={formData.patientSignature}
                        alt="Firma del paciente"
                        className="border rounded-lg p-2"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignaturePad('patient')}
                        className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                      >
                        Cambiar firma
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowSignaturePad('patient')}
                      className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors"
                    >
                      Hacer clic para firmar
                    </button>
                  )}
                  {errors.patientSignature && (
                    <p className="mt-1 text-sm text-red-600">{errors.patientSignature}</p>
                  )}
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Firma del Doctor</p>
                  {formData.doctorSignature ? (
                    <div className="relative">
                      <img
                        src={formData.doctorSignature}
                        alt="Firma del doctor"
                        className="border rounded-lg p-2"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignaturePad('doctor')}
                        className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                      >
                        Cambiar firma
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowSignaturePad('doctor')}
                      className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors"
                    >
                      Hacer clic para firmar
                    </button>
                  )}
                  {errors.doctorSignature && (
                    <p className="mt-1 text-sm text-red-600">{errors.doctorSignature}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Terms Acceptance */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="acceptsTerms"
                name="acceptsTerms"
                checked={formData.acceptsTerms}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="acceptsTerms" className="text-sm text-gray-700">
                He leído y acepto los términos y condiciones del tratamiento
              </label>
            </div>
            {errors.acceptsTerms && (
              <p className="text-sm text-red-600">{errors.acceptsTerms}</p>
            )}

            <div className="flex justify-end gap-3 pt-6 border-t sticky bottom-0 bg-white">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <CheckSquare className="h-5 w-5" />
                Generar Consentimiento
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Signature Pad Modal */}
      {showSignaturePad && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">
                {showSignaturePad === 'patient' ? 'Firma del Paciente' : 'Firma del Doctor'}
              </h3>
              <button
                onClick={() => setShowSignaturePad(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <SignaturePadComponent onSave={handleSignatureSave} />
          </div>
        </div>
      )}
    </div>
  );
}