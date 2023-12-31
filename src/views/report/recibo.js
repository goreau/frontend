import jsPDF from 'jspdf';
import addressService from "@/services/address.service";

var recibo = {
    async getRecibo(obj){
        var address = await this.getAddress(obj.id_unidade);
        
        var data = new Date();

        var dia = data.getDate();
        var ano = data.getFullYear();
        // Obter o mês por extenso em português do Brasil
        var mes = data.toLocaleDateString('pt-BR', {month: 'long'});

        var formatedDate = dia + ' de ' + mes + ' de ' + ano;

        let pdfName = 'Recibo'; 
        var doc = new jsPDF();
        var img = await this.getImage();
        doc.addImage(img, "JPEG", 5, 5, 30, 30);

       // doc.setFont('arial', 'bold');
        doc.setFontSize(15);
        doc.text("Secretaria de Estado da Saúde",115,15,null,null,'center');
        doc.text("COORDENADORIA DE CONTROLE DE DOENÇAS",115,25,null,null,'center');
        doc.setFontSize(10);
        doc.text(address.logradouro + ', ' + address.numero + ' - ' + address.bairro + ' - ' 
            + address.cidade + '/SP - Tel.: (' +  address.ddd + ') ' + address.telefone, 115,35,null,null,'center');
        doc.setLineWidth(0.5);
        doc.line(10, 40, 200, 40);

        doc.setFontSize(20);
        doc.text('R E C I B O',105,50,'center');
        doc.setFontSize(15);
        doc.text(address.cidade + ", " + formatedDate, 200, 75, null, null, "right");

        doc.text('Recebi em '+ obj.data +', da Secretaria de Estado da Saúde/SP o',10,110);
        doc.text('produto abaixo relacionado, para uso no Controle de Vetores no município de', 10,120);
        doc.text(obj.municipio,10,130);

        doc.setDrawColor(255, 255, 255); 
        var dados = [{Produto: obj.produto, Lote: obj.lote, Validade: obj.validade, Quantidade: obj.qtd, Unidade: obj.unidade}];
        var header = ['Produto', 'Lote', 'Validade','Quantidade','Unidade'];
        doc.table(20,150, dados, header, { autoSize: true, padding: 5, headerBackgroundColor: '#fff' });

        doc.text('Entregue por:',105,200,'center');
        doc.text('Nome:.......................................................................................',60,210);
        doc.text('Função:....................................................................................',60,220);

        doc.text('Recebido:',105,240,'center');
        doc.text('Data:________/________/_________________',60,250);
        doc.text('Nome:....................................................................................',60,260);
        doc.text('Assinatura:.....................................................................................',50,270);
        
        doc.save(pdfName + '.pdf');
    },
    async getAddress(local){
        var address = {};
        await addressService.getAddressRecibo(local).then(
            (response) => {
                let data = response.data;
                if (data == ''){
                    address.bairro = 'Luz';
                    address.ddd = 11;
                    address.cep = '01246-900';
                    address.id_unidade = 1;
                    address.logradouro = 'Av. Dr. Arnaldo';
                    address.numero = 351;
                    address.complemento = '1º Andar';
                    address.telefone = '3066-8604';
                    address.cidade = 'São Paulo';
                } else {
                    address.bairro = data.bairro;
                    address.ddd = data.ddd;
                    address.cep = data.cep;
                    address.id_unidade = data.id_unidade;
                    address.logradouro = data.logradouro;
                    address.numero = data.numero;
                    address.complemento = data.complemento;
                    address.telefone = data.telefone;
                    address.cidade = data.cidade;
                }
                
            },
            (error) => {
                address = {};
            }
        );
        return address;
    },
    async getImage(){
       /* var c = document.createElement('canvas');
        var img = document.createElement('img');
        img.src = '../../../assets/brasao.jpg';
        
        c.height = img.naturalHeight;
        c.width = img.naturalWidth;
        var ctx = c.getContext('2d');

        ctx.drawImage(img, 0, 0, c.width, c.height);
        var base64String = c.toDataURL();*/

        var base64String = "data:image/jpeg;base64,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"
        return base64String;
    }
}

export default recibo;